if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/* Express, mongoose, and mongoose models */
const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Town = require('./models/town')

/* Libraries for uploading and reading schedule csv */
const multer = require('multer')
const upload = multer({ dest: 'tmp/csv/' })
const csv = require('csvtojson')
const fs = require('fs')
const dateParse = require('./util/date-parse')

/* Port and view engine */
const app = express()
const path = require('path')
const port = process.env.PORT || 3000
const hbs_config = require('./util/hbs-config')
hbs_config()
app.set('view engine', 'hbs')
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

/* Libraries for hashing/handling passwords */
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./util/passport-config')
initializePassport(
    passport,
    (user_name) => {
        return User.findOne({ user_name: user_name }).exec()
    },
    (_id) => {
        return User.findOne({ _id: _id })
    }
)
const flash = require('express-flash')
const session = require('express-session')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

/* Emailing through Node */
const email = require('./util/send-email')
const transporter = email.configTransporter(process.env.EMAIL_USER, process.env.EMAIL_PASS, 'gmail')

/* Middleware */
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/* Constants */
const CURRENT_YEAR = 2020

/* Function to check if user is authenticated */
const checkAuthentification = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

/* Function to get the towns associated with a particular team and day */
const getDayTowns = (team, year, month, day) => {
    const dayLimits = dateParse.getStartAndEndOfDay(year, month, day)
    return Town.find({
        assigned_team: team,
        /* Checks scheduled time is after start of day but before end of day */
        scheduled_time: { $gt: dayLimits.start, $lt: dayLimits.end }
    })
}

/* GET for default dashboard page */
const dashboardController = (req, res) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()
    const urlString = '/dashboard/' + year + '/' + month + '/' + day
    res.redirect(urlString)
}
app.get('/', checkAuthentification, dashboardController)
app.get('/dashboard', checkAuthentification, dashboardController)

/* GET for dashboard page with date */
app.get('/dashboard/:year/:month/:day', checkAuthentification, async (req, res) => {
    try {
        var day_towns = await getDayTowns(req.user.assigned_team, req.params.year,
            req.params.month, req.params.day)
        if (day_towns.length == 0) day_towns = null
        res.render('dashboard.hbs', {
            user: req.user,
            towns: day_towns,
            year: req.params.year,
            month: dateParse.monthAbbrevArray[req.params.month],
            day: req.params.day,
            day_of_week: dateParse.getDayOfWeek(req.params.year, req.params.month, req.params.day),
            dateFormString: dateParse.getDateFormString(req.params.year, req.params.month, req.params.day)
        })
    } catch (e) {
        res.send(e)
    }
})

/* POST for changing date on dashboard page */
app.post('/dashboard/date', checkAuthentification, (req, res) => {
    const newDateArray = req.body.new_date.split("-")
    const newURL = '/dashboard/' + newDateArray[0] + '/' + (parseInt(newDateArray[1]) - 1) +
        '/' + parseInt(newDateArray[2])
    res.redirect(newURL)
})

/* GET for town-report home page */
app.get('/town-report', checkAuthentification, async (req, res) => {
    try {
        const allTowns = await Town.find({})
        res.render('town-report-home', {
            user: req.user,
            towns: allTowns
        })
    } catch (e) {
        res.send(e)
    }
})

/* GET for town-specific town-report page */
app.get('/town-report/:_id', checkAuthentification, async (req, res) => {
    try {
        const currTown = await Town.findById(req.params._id)
        res.render('town-report', {
            user: req.user,
            town: currTown,
            _id: req.params._id
        })
    } catch (e) {
        res.send(e)
    }
})

/* POST for selecting town-report from home town-report page */
app.post('/town-report/home', checkAuthentification, (req, res) => {
    const townURL = '/town-report/' + req.body.selected_town_id
    res.redirect(townURL)
})

/* POST for updating town report for town-specific town-report page */
app.post('/town-report/update', checkAuthentification, async (req, res) => {
    try {
        const _id = req.body._id
        const currTown = await Town.findById(_id)

        /* Update the tech_notes and num_serviced attributes */
        await currTown.updateOne({
            tech_notes: req.body.notes,
            num_serviced: req.body.num_serviced
        }, {
            runValidators: true
        })

        /* Update the problems array attribute */
        /* Clear the problems array so we can push current values */
        await currTown.updateOne({
            problems: []
        })
        for (const [key, value] of Object.entries(req.body)) {
            const item_name_prefix = "item_name_"
            if (key.startsWith(item_name_prefix)) {
                var item_row_num = parseInt(key.slice(item_name_prefix.length))
                const newProblem = {
                    item_name: req['body']["item_name_" + parseInt(item_row_num)],
                    replaced: req['body']["num_replaced_" + parseInt(item_row_num)],
                    will_ship: req['body']["num_ship_" + parseInt(item_row_num)]
                }
                await currTown.updateOne({
                    '$push': { 'problems': newProblem }
                })
            }
        }

        /* If email address included in form, send email to address */
        if (req.body.email_address) {
            const updatedTown = await Town.findById(_id)
            email.sendEmail(transporter, process.env.EMAIL_USER, req.body.email_address, updatedTown, req.user)
        }
        res.redirect('/town-report/' + _id)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

/* GET for admin page */
app.get('/admin', checkAuthentification, async (req, res) => {
    try {
        const allTowns = await Town.find({}).sort('scheduled_time')
        res.render('admin', {
            user: req.user,
            towns: allTowns
        })
    } catch (e) {
        res.send(e)
    }
})

/* GET for schedule upload from admin page */
app.get('/admin/upload-schedule', checkAuthentification, (req, res) => {
    res.render('admin-schedule-upload')
})

/* POST for schedule upload from admin page */
app.post('/admin/upload-schedule', checkAuthentification, upload.single('schedule'), async (req, res) => {
    try {
        /* Get csv from upload, store in temp file, and convert to JSON*/
        var scheduleJSON = await csv({
            ignoreEmpty: true
        }).fromFile(req.file.path)
        /* Delete temp file */
        fs.unlinkSync(req.file.path)
        console.log(scheduleJSON.length, "towns found")

        /* Add towns to database */
        for (var i = 0; i < scheduleJSON.length; i++) {
            console.log(scheduleJSON[i].name)
            /* Convert date and time fields into UTC Date data type */
            dateString = scheduleJSON[i].date
            timeString = scheduleJSON[i].time
            scheduleJSON[i].time_string = timeString
            const date = dateParse.getDateObj(dateString, timeString, CURRENT_YEAR)
            scheduleJSON[i].scheduled_time = date
            const newTown = new Town(scheduleJSON[i])
            await newTown.save()
        }
        console.log('All towns added')
    } catch (e) {
        res.send(e)
    }
})

/* GET for user registration from admin page */
app.get('/admin/register', checkAuthentification, async (req, res) => {
    try {
        const allUsers = await User.find({}).sort("assigned_team")
        res.render('admin-register', {
            user: req.user,
            all_users: allUsers
        })
    } catch (e) {
        res.send(e)
    }
})

/* POST for registering an account */
app.post('/admin/register', checkAuthentification, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        var isAdmin = false
        if (req.body.admin) isAdmin = true
        const newUser = new User({
            name: req.body.name,
            user_name: req.body.user_name,
            password: hashedPassword,
            admin: isAdmin,
            assigned_team: req.body.assigned_team
        })
        await newUser.save()
        console.log("New user created")
        res.redirect('/admin/register')
    } catch (e) {
        res.send(e)
    }
})

/* GET for follow-up home page */
app.get('/follow-up', checkAuthentification, async (req, res) => {
    try {
        const allTowns = await Town.find({})
        res.render('follow-up-home', {
            user: req.user,
            towns: allTowns
        })
    } catch (e) {
        res.send(e)
    }
})

/* POST for selecting town from follow-up home page */
app.post('/follow-up/home', checkAuthentification, async (req, res) => {
    const townURL = '/follow-up/' + req.body.selected_town_id
    res.redirect(townURL)
})

/* GET for town-specific follow-up page */
app.get('/follow-up/:_id', checkAuthentification, async (req, res) => {
    const _id = req.params._id
    try {
        const currTown = await Town.findById(_id)
        res.render('follow-up', {
            user: req.user,
            town: currTown
        })
    } catch (e) {
        res.send(e)
    }
})

/* POST for updating shipping info from follow-up page */
app.post('/follow-up/update', checkAuthentification, async (req, res) => {
    try {
        const currTown = await Town.findById(req.body._id)
        await currTown.updateOne({
            ship_status: req.body.ship_status,
            ship_date: req.body.ship_date,
            ship_tech: req.body.ship_tech,
            ship_notes: req.body.ship_notes
        }, {
            runValidators: true
        })
        res.redirect('/follow-up/' + req.body._id)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

/* GET for user profile page */
app.get('/user', checkAuthentification, (req, res) => {
    res.render('user', {
        user: req.user
    })
})

/* GET for change password page */
app.get('/user/change-password', checkAuthentification, (req, res) => {
    res.render('user-change-password', {
        user: req.user
    })
})

/* GET for change password page after issue */
app.get('/user/change-password/:issue', checkAuthentification, (req, res) => {
    var issueMsg = ""
    var successMsg = ""
    if (req.params.issue === "current") {
        issueMsg = "Current password was incorrect"
    } else if (req.params.issue === "new") {
        issueMsg = "New passwords did not match"
    } else if (req.params.issue === "success") {
        successMsg = "New password saved!"
    }
    res.render('user-change-password', {
        user: req.user,
        issueMsg: issueMsg,
        successMsg: successMsg
    })
})

/* POST for changing password */
app.post('/user/change-password', checkAuthentification, async (req, res) => {
    try {
        const user = req.user
        if (!await bcrypt.compare(req.body.current_pw, user.password)) {
            return res.redirect('/user/change-password/current')
        }
        if (req.body.new_pw != req.body.confirm_pw) {
            return res.redirect('/user/change-password/new')
        }
        const newHashedPassword = await bcrypt.hash(req.body.new_pw, 10)
        const currUser = await User.findById(user._id)
        await currUser.updateOne({
            password: newHashedPassword
        }, {
            runValidators: true
        })
        res.redirect('/user/change-password/success')
    } catch (e) {
        res.send(e)
        console.log(e)
    }
})

/* GET for login page*/
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    res.render('login', {
        message: req.flash('error')
    })
})

/* POST for signing in a user */
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

/* GET for logging out a user */
app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

app.listen(port, () => {
    console.log('Server is up on port' + port)
})