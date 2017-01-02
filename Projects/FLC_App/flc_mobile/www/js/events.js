import $ from 'jquery';
import '../css/events.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import '../lib/font-awesome.min.css';
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { fetchData } from './fetchData';
import { applyFastClick } from './fastclick';
import { applyBackTransition } from './backtransition';

applyBackTransition();
applyFastClick();

var state = {
    isEventsLoading: true,
    hasFetchError: false,
}
var events;

fetchData("events")
    .done(handleEvents)
    .fail(handleError);

function handleEvents(data) {
    state.isEventsLoading = false;
    events = $.extend([], data); // copies data into classes
    createEvents("#schedule-container", events);
}

function handleError() {
    state.hasFetchError = true;
}

function createEvents(div, events) {
    $.each(events, function(index, value) {
        let eventTitle = value['title'] || "";
        let eventDate = value['date'] || "";
        let eventLocation = value['location'] || "";
        let eventDescription = value['description'] || "";
        $(div).append(eventInfo(eventTitle, eventDate, eventLocation, eventDescription));
    });
}

// Returns a string representing the HTML of an event element
function eventInfo(title, date, location, description) {
    return (
        "<div class='event-object'>\
            <div class='event-text-container'>\
                <div class='event-title'>" + title + "</div>\
                <div class='event-date'><b>Date: </b>" + date + "</div>\
                <div class='event-location'><b>Location: </b>" + location + "</div>\
                <div class='event-description'>" + description + "</div>\
            </div>\
            <div class='event-arrow'>\
                <i class='material-icons'>star</i>\
            </div>\
        </div>"
    );
}
