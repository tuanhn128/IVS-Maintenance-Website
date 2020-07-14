const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByName, getUserByID) {
    const authenticateUser = async (user_name, password, done) => {
        try {
            const user = await getUserByName(user_name)
            if (!user) {
                return done(null, false, { message: "No user with that user_name" })
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: "Password did not match" })
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'user_name'}, authenticateUser))
    passport.serializeUser((user, done) => {
         done(null, user.id)
    })
    passport.deserializeUser(async (_id, done) => {
        const user = await getUserByID(_id)
        return done(null, user)
    })
}

module.exports = initialize