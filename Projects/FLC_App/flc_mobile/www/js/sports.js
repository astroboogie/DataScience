import $ from 'jquery';
import '../css/sports.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import '../lib/font-awesome.min.css';
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { fetchData } from './fetchData';
import { applyFastClick } from './fastclick';
import { applyBackTransition } from './backtransition';
import { displayLoadingSpinner, fadeOutLoadingSpinner } from './loading';
import { errorPage } from './error';

applyBackTransition();
applyFastClick();
displayLoadingSpinner();

fetchData("sports")
    .done(handleSports)
    .fail(handleError);

function handleSports(data) {
    fadeOutLoadingSpinner("body", 150);
    $("#sports-container").empty();
    createSports("#sports-container", data);
}

function handleError() {
    fadeOutLoadingSpinner(250);
    $("#sports-container").empty();
    errorPage("#sports-container");
}

function createSports(div, sports) {
    console.log("SPORTS: ", sports)
    $.each(sports, function(index, value) {
        let sport = value['sport'] || "";
        let date = value['date'] || "";
        let opponent = value['opponent'] || "";
        let site = value['neutralSite'] || "";
        let time = value['time'] || "";
        $(div).append(sportInfo(sport, date, opponent, site, time));
    });
}

// Returns a string representing the HTML of an event element
function sportInfo(sport, date, opponent, site, time) {
    console.log("OPPONENT: ", opponent);
    console.log("SITE: ", site);
    return (
        "<div class='sport-object'>\
            <div class='sport-text-container'>\
                <div class='sport-title'>" + sport + "</div>\
                <div class='sport-date'><b>Date: </b>" + date + "</div>\
                <div class='sport-location'><b>Location: </b>" + opponent + " " + site + "</div>\
                <div class='sport-description'>" + time + "</div>\
            </div>\
            <div class='sport-arrow'>\
                <i class='material-icons'>star</i>\
            </div>\
        </div>"
    );
}
