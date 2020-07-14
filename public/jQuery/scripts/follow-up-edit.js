
$(document).ready(() => {
    if ($(".shipping-item-row").length === 0) {
        $("#no-items").toggle()
    }

    $("#edit-follow-up").click(function (e) {
        e.preventDefault()
        $(".shipping-input").toggle()
    })
})