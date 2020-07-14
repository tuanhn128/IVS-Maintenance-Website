$(document).ready(() => {
    $(".town-report-link").click(function (e) {
        e.stopPropagation()
    })
    
    $(".dashboard-towns-a").click(function (e) {
        e.preventDefault()
        $(this).children('.dashboard-info').toggle()
    })
})