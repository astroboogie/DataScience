// fast Click
$(function() {
    FastClick.attach(document.body);
});

// Page Enter Transition
var pageArray = window.location.pathname.split("/");
var pageName = pageArray[pageArray.length - 1];

// if (pageName == "schedule.html") {
if (true) {
    $("body > *").css("opacity", 0).animate({
        opacity: "1"
    }, 150);
}