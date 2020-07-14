/* Arrays that will allow conversion between month/day of week indices and strings*/
monthAbbrevArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
dayOfWeekArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/* Takes in the year, month, and day (as numbers) and returns the start and end of that day,
   in local time, as date objects */
const getStartAndEndOfDay = (year, month, day) => {
    var start = new Date()
    timeZoneDiff = start.getTimezoneOffset() / 60
    start.setFullYear(year)
    start.setMonth(month)
    start.setDate(day)
    start.setHours(timeZoneDiff, 0, 0, 0)
    var end = new Date()
    end.setFullYear(year)
    end.setMonth(month)
    end.setDate(day)
    end.setHours(timeZoneDiff + 24, 59, 59, 999)
    return {
        start: start,
        end: end
    }
}

/* Takes in the year, month, and day (as numbers) and returns a string representing 
   the day of the week */
const getDayOfWeek = (year, month, day) => {
    var d = new Date()
    d.setFullYear(year)
    d.setMonth(month)
    d.setDate(day)
    return dayOfWeekArray[d.getDay()]
}

/* Takes in the year, month, and day (as numbers) and returns a string of that date in 
   YYYY-MM-DD format */
const getDateFormString = (year, month, day) => {
    var editedMonth = (parseInt(month) + 1).toString() // Javascript month numbers are zero-indexed
    if (parseInt(editedMonth) < 10) {
        editedMonth = "0" + editedMonth
    }
    var editedDay = day
    if (parseInt(editedDay) < 10) {
        editedDay = "0" + editedDay
    }
    return year + "-" + editedMonth + "-" + editedDay
}

/* Takes in the strings taken from the schedule csv and returns 
   a date object corresponding to that day and time */
const getDateObj = (dateString, timeString, CURRENT_YEAR) => {
    const monthStart = dateString.indexOf(" ") + 1
    const monthEnd = dateString.search(/\d/)
    const monthAbbrev = dateString.slice(monthStart, monthEnd).trim()
    const month = monthAbbrevArray.indexOf(monthAbbrev)
    const day = parseInt(dateString.slice(monthEnd))

    const colonIndex = timeString.indexOf(':')
    var hour = parseInt(timeString.slice(0, colonIndex))
    const timeOfDay = timeString.slice(-2,)
    if (timeOfDay === "PM") hour += 12
    const minute = parseInt(timeString.slice(colonIndex + 1, colonIndex + 3))

    const date = new Date(CURRENT_YEAR, month, day, hour, minute)
    return date
}

module.exports = {
    monthAbbrevArray: monthAbbrevArray,
    getDayOfWeek: getDayOfWeek,
    getDateObj: getDateObj,
    getStartAndEndOfDay: getStartAndEndOfDay,
    getDateFormString: getDateFormString
}