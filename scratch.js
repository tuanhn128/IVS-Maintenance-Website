const sendEmail = require('./src/util/send-email')

const town = {
    name: "Test Town"
}

sendEmail("tuanhn@stanford.edu", town)