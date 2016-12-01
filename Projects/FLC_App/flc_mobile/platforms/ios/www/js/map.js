// Page Leave Transition
$("#back-arrow").click(function () {
    $("body > *").animate({
        opacity: "0"
    }, 150, function() {
        window.location = "index.html";
    });
});