import $ from 'jquery';
import '../css/clubs.css';
import '../css/mobileView.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import { fetchData } from './fetchData';
import { applyFastClick } from './fastclick';
import { applyBackTransition } from './backtransition';
import { displayLoadingSpinner, fadeOutLoadingSpinner } from './loading';
import { errorPage } from './error';

applyBackTransition();
applyFastClick();
displayLoadingSpinner();

fetchData("clubs")
    .done(handleClubs)
    .fail(handleError);

function handleClubs(data) {
    fadeOutLoadingSpinner("body", 150);
    $("#clubs-container").empty();
    createClubs("#clubs-container", data);
}

function handleError() {
    fadeOutLoadingSpinner(250);
    $("#clubs-container").empty();
    errorPage("#clubs-container");
}

function createClubs(div, clubs) {
    console.log("clubs: ", clubs);
    $.each(clubs, function(index, value) {
        let club = value['club'] || "";
        let meeting = value['meeting'] || "";
        let advisor = value['advisor'] || "";
        let president = value['president'] || "";
        $(div).append(clubInfo(club, date, opponent, site));
    });
}

// Returns a string representing the HTML of an event element
function clubInfo(club, meeting, advisor, president) {
    return (
        "<div class='club-object'>\
            <div class='club-text-container'>\
                <div class='club-title'>" + club + "</div>\
                <div class='club-meeting'><b>Meeting: </b>" + meeting + "</div>\
                <div class='club-advisor'><b>Advisor: </b>" + advisor + "</div>\
                <div class='club-president'><b>President: </b>" + president + "</div>\
            </div>\
            <div class='club-arrow'>\
                <i class='material-icons'>star</i>\
            </div>\
        </div>"
    );
}
