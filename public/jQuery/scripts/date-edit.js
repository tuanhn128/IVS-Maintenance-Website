$(document).ready(() => {
    $("#date-edit").click((e) => {
        e.preventDefault()
        $("#date-form").toggle()
        $("#date-text").toggle()
    })
})