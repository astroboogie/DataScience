// Page Leave Transition
$("#back-arrow").click(function () {
    $("body > *").animate({
        opacity: "0"
    }, 150, function() {
        window.location = "index.html";
    });
});

let url = "https://s3-us-west-1.amazonaws.com/flc-app-data/events.json";
$.ajax({
    url: url,
    type: "GET",
    success: function(data) {
        $.each(data, function(index, value) {
            let eventTitle = value['title'] || "";
            let eventDescription = value['description'] || ""
            let eventLocation = value['location'] || ""
            let eventDate = value['date'] || ""
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
        });
    },
});
