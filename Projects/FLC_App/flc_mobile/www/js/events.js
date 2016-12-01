// Page Leave Transition
$("#back-arrow").click(function () {
    $("body > *").animate({
        opacity: "0"
    }, 150, function() {
        window.location = "index.html";
    });
});

var eventsData;

$.getJSON("testEvents.json", function(data) {
    eventsData = data;
}).done(function () {
    $(eventsData['testEvents']).each(function(index, value) {
        var eventTitle = value['name'];
        $("#schedule-container").append("<div class='event-object'>" + eventTitle + "</div>");
        console.log(value['name']);
    });
});