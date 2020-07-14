$(document).ready(() => {
    $("#select-team").selectize({
        create: true,
        placeholder: "Choose Team",
        valueField: "team",
        labelField: "team",
        options: $(".assigned-team").map(function () {
            return { team: $(this).text() }
        }).get().filter((element, index, array) => {
            return array.indexOf(element) === index
        })
    })

    $("#add-user-btn, #cancel-user-btn").click(function (e) {
        e.preventDefault()
        $(".user-form").children().toggle()
    })
})
 