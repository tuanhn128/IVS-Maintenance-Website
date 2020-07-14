const hbs = require('hbs')

const config_hbs = () => {
    hbs.registerHelper("addInts", (a, b) => {
        return (parseInt(a) + parseInt(b)).toString()
    })
    hbs.registerHelper("ifEquals", function(a, b, options) {
        if (a === b) {
            return options.fn(this)
        }
        return options.inverse(this)
    })
    hbs.registerHelper("getDate", (d) => {
        return d.toDateString()
    })
}

module.exports = config_hbs
