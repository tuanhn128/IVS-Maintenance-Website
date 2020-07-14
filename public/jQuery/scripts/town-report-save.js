/* Toggles the last (new problem) row in the problem table, the edit and delete problem buttons, the 
   values/inputs for the machines serviced and notes fields, and the save/confirm save report buttons */
jQuery.toggleSaveConfirmReport = () => {
    /* If there is only one row in the table (no saved problems), toggle the "No problems found text" 
       and hide the whole table. Otherwise, just toggle the new-problem row and the edit and delete 
       buttons of the other rows */
    if ($(".problem-row").length == 1) {
        $("#no-problems-text").toggle()
        $(".town-report-table").toggle()
    } else {
        $("#problem-table tr:last").toggle()
        $(".edit-problem, .delete-problem").toggle()
    }
    $(".systems-serviced").toggle()
    $(".tech-notes").toggle()
    $(".town-report-btn").toggle()
    $(".confirm-save").toggle()
}

/* Update text values for num serviced and notes */
jQuery.updateMachinesAndNotesText = () => {
    var num_serviced = $("input.systems-serviced").val()
    $("span.systems-serviced").text(num_serviced)
    var tech_notes = $("textarea.tech-notes").val()
    if (tech_notes.trim().length == 0) {
        tech_notes = "No notes added"
    }
    $("p.tech-notes").text(tech_notes)
}

/* Validates the email address input field of the selected problem row. Returns true if email
   is valid and false if invalid. If there is an issue, alerts user of the problem with pop-up */
jQuery.validateEmailAddress = () => {
    var emailRegex = /\S+@\S+\.\S+/
    var currEmail = $("#email-field").val()
    if (!emailRegex.test(currEmail)) {
        console.log(currEmail)
        alert("Please enter a valid email address!")
        return false
    }
    return true
}

$(document).ready(() => {
    /* If user clicks email button. Reveal the email address field and email save/cancel buttons */
    $("#email-button").click(function (e) {
        e.preventDefault()
        $(".town-report-btn").children().toggle()
        $("#email-form").toggle()
    })

    /* If user clicks cancel email button, toggle the email buttons/field, and also reset the 
       value of the email address field. */
    $("#cancel-email").click(function (e) {
        e.preventDefault()
        $(".town-report-btn").children().toggle()
        $("#email-field").val("")
        $("#email-form").toggle()
    })

    /* If user clicks save button, reveal confirm save button, and hide the form elements to show
       the report values as text */
    $("#save-report").click(function (e) {
        e.preventDefault()
        jQuery.toggleSaveConfirmReport()
        jQuery.updateMachinesAndNotesText()
    })

    /* If user clicks "Save Report and Send Email" button, validate email address and then do the
       same as above */
    $("#save-report-email").click(function (e) {
        e.preventDefault()
        if (!jQuery.validateEmailAddress()) return
        $("p.email-address").text($("#email-field").val())
        $(".email-address").toggle()
        jQuery.toggleSaveConfirmReport()
        jQuery.updateMachinesAndNotesText()
    })

    /* If user clicks back from confirm save button, hide the confirm save button, and reshow the form
       elements */
    $("#cancel-save").click(function (e) {
        e.preventDefault()
        jQuery.toggleSaveConfirmReport()
        if ($("#email-form").is(":visible") && $("#email-field").is(":hidden")) {
            $(".email-address").toggle()
        }
    })
})