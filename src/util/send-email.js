/* Libarary for sending emails */
const nodemailer = require('nodemailer')

const configTransporter = (email_user, email_pass, service) => {
    return nodemailer.createTransport({
        service: service,
        auth: {
            user: email_user,
            pass: email_pass
        }
    })
}

const buildEmailText = (town, user) => {
    const title = '<h2 style="text-align: center;">Maintenance Report for ' + town.name + '</h2>'
    const pOpen = '<p style="text-align: center; line-height: 1.5em;">'
    var content = '<br><b>Maintenance scheduled for</b>:<br> ' + town.time_string + ', ' + town.scheduled_time.toLocaleDateString() + '<br>'
    content += '<br><b>Machines Serviced</b>: <br> ' + town.num_serviced + ' of ' + town.num_machines + '<br>'
    content += '<br><b>Equipment Problems</b>:<br> '
    if (town.problems.length == 0) {
        content += 'No problems found<br>'
    } else {
        for (let i = 0; i < town.problems.length; i++) {
            var currProblem = town.problems[i]
            content += 'Issue with ' + currProblem.item_name + '. '
            if (currProblem.replaced > 0) content += currProblem.replaced + ' replaced during maintenance. '
            if (currProblem.will_ship > 0) content += currProblem.will_ship + ' to be shipped in future.'
            content += '<br>'
        }
    }
    content += '<br>'
    if (town.tech_notes) {
        content += '<b>Additional Notes</b>:<br> ' + town.tech_notes + '<br><br>'
    }
    if (user) {
        content += '<b>Name of Technician</b>:<br> ' + user.name + '<br>'
    }
    content += '<br><br><hr> Please do not reply to this email. If you which to reach us, please email us at: nancy.mudd@ivsllc.com'
    content += '<br> Or call us at: (855)-730-6161'
    const pClose = '</p>'
    return title + pOpen + content + pClose
}

const sendEmail = (transporter, from_email, email_address, town, user) => {
    transporter.sendMail({
        from: from_email,
        to: email_address,
        subject: "IVS Maintenance Report",
        html: buildEmailText(town, user)
    }, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

module.exports = {
    configTransporter: configTransporter,
    sendEmail: sendEmail
}