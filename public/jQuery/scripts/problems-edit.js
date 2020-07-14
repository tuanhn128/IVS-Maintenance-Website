jQuery.fn.extend({
    /* Takes in a problem table jQuery element and returns the row number as a string */
    getProblemRowNum: function () {
        var currID = $(this).attr('id')
        return currID.slice(currID.indexOf('-') + 1)
    }
})

/* Takes in a problem row number and toggles the new-problem row and the edit and delete 
   buttons of other rows so that the user is only editing one problem at a time. Also 
   toggles the buttons, inputs, and text fields for that particular row */
jQuery.toggleEditSaveProblem = (rowNum) => {
    $("button.edit-problem, button.delete-problem").
        not("#edit-" + rowNum + ", #delete-" + rowNum).toggle()
    $(".new-problem").toggle()
    $('tr#row-' + rowNum).children().children().toggle()
    $(".town-report-btn").toggle()
}

/* Validates the item_name, num_replaced, and to_ship input fields of the selected problem row. 
   Returns true if all are valid and false if invalid. If there is an issue, alerts user of the 
   problem with pop-up */
jQuery.validateProblem = (rowNum) => {
    var textVal = $("tr#row-" + rowNum).find(":input.item_name").val()
    if (textVal.trim().length == 0) {
        alert("Please type in an item name for problem!")
        return false
    }
    var repVal = parseInt($("tr#row-" + rowNum).find(":input.num_replaced").val())
    console.log(repVal)
    var shipVal = parseInt($("tr#row-" + rowNum).find(":input.num_ship").val())
    console.log(shipVal)
    if (repVal === 0 && shipVal === 0) {
        alert("Replaced and Will Ship both equal to 0. Please update quantity!")
        return false
    }
    return true
}


$(document).ready(() => {
    /* Adds a new problem */
    $("#problem-table").on("click", "button.new-problem", function (e) {
        e.preventDefault()
        var currRowNum = parseInt($(".problem-row:last").getProblemRowNum())
        var nextRowNum = currRowNum + 1
        /* Validate new problem */
        if(!jQuery.validateProblem(currRowNum)) return 
        /* Add edit and delete buttons as well as a hidden save button to the row */
        var newButtons = '<button type="button" id="edit-' + currRowNum + '" class="edit-problem btn btn-outline-dark mx-auto">Edit</button><button type="button" id="delete-' + currRowNum + '" class="delete-problem btn btn-outline-dark mx-auto">Delete</button><button type="button" id="save-' + currRowNum + '" class="save-problem btn btn-outline-dark mx-auto" style="display: none;">Save</button>'
        $("button.new-problem").after(newButtons)
        /* Delete the add button and hide the input fields for the recently completed row */
        $("button.new-problem").remove()
        $(".new-problem").toggle()
        /* Add the text of the value in the place of where the input fields were and
           add correctly numbered and labelled name attributes to the input fields (for 
           eventual POST request) */
        $("input.new-problem").each((index, elem) => {
            $(elem).after('<p class="problem-text-' + currRowNum + '">' + $(elem).val() + '</p>')
            var newName = ""
            if ($(elem).hasClass("item_name")) {
                newName = "item_name_" + currRowNum
            } else if ($(elem).hasClass("num_replaced")) {
                newName = "num_replaced_" + currRowNum
            } else {
                newName = "num_ship_" + currRowNum
            }
            $(elem).attr('name', newName)
        })
        /* Remove the new-problem class from the saved row */
        $(".new-problem").each((index, elem) => {
            $(elem).removeClass("new-problem")
        })
        /* Add a new row of input fields at the bottom of the table which will now 
           have the new-problem class */
        var newProblemRow = '<tr class="problem-row" id="row-' + nextRowNum + '"><td><input type="text" class="item_name new-problem mx-auto"></td><td><input type="number" min="0" value=0 class="num_replaced new-problem mx-auto"></td><td><input type="number" min="0" value=0 class="num_ship new-problem mx-auto"></td><td><button type="button" class="new-problem btn btn-outline-dark mx-auto">Add</button></td></tr>'
        $("#problem-table tr:last").after(newProblemRow)
    })

    /* Allows row corresponding to clicked edit button to be edited once again */
    $("#problem-table").on("click", "button.edit-problem", function (e) {
        e.preventDefault()
        var editRowNum = $(this).getProblemRowNum()
        jQuery.toggleEditSaveProblem(editRowNum)
    })

    /* Saves the edit for the row corresponding to the clicked save button */
    $('#problem-table').on("click", "button.save-problem", function (e) {
        e.preventDefault()
        var saveRowNum = $(this).getProblemRowNum()
        /* Validate new problem */
        if(!jQuery.validateProblem(saveRowNum)) return 
        /* Update the text values */
        $('.problem-text-' + saveRowNum).each((index, elem) => {
            var newText = $(elem).siblings(":input").val()
            $(elem).text(newText)
        })
        jQuery.toggleEditSaveProblem(saveRowNum)
    })

    /* Deletes the row corresponding to the clicked delete button */
    $("#problem-table").on("click", "button.delete-problem", function (e) {
        e.preventDefault()
        var deleteRowNum = $(this).getProblemRowNum()
        $('tr#row-' + deleteRowNum).remove()
    })
})