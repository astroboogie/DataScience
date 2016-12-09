// Page Leave Transition
$("#back-arrow").click(function () {
    $("body > *").animate({
        opacity: "0"
    }, 150, function() {
        window.location = "index.html";
    });
});

var eventsData;

$.getJSON("backend.json", function(data) {
    eventsData = data['events'];
}).done(function () {
    $.each(eventsData, function(index, value) {
        var eventTitle = value['title'] || "";
        var eventDescription = value['description'] || ""
        var eventLocation = value['location'] || ""
        var eventDate = value['date'] || ""
        $("#schedule-container").append(
            "<div class='event-object'>\
                <div class='event-text-container'>\
                    <div class='event-title'>" + eventTitle + "</div>\
                    <div class='event-date'><b>Date: </b>" + eventDate + "</div>\
                    <div class='event-location'><b>Location: </b>" + eventLocation + "</div>\
                    <div class='event-description'>" + eventDescription + "</div>\
                </div>\
                <div class='event-arrow'>\
                    <i class='material-icons'>star</i>\
                </div>\
            </div>");
        console.log(value['name']);
    });
});
