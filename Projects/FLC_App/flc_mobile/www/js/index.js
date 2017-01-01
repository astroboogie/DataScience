import $ from 'jquery';
import '../css/index.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import '../lib/font-awesome.min.css';
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { applyFastClick } from './fastclick';

applyFastClick();

// Page Enter Transition
var pageArray = window.location.pathname.split("/");
var pageName = pageArray[pageArray.length - 1];

$("body > *").css("opacity", 0).animate({
    opacity: "1"
}, 150);

// Page Leave Transition
$(".button-object").click(function () {
    var clickedObject = $(this);

    var destination = clickedObject.attr('id').split("-")[1];
    console.log(destination);

    $("body > *").not("body > #background-container").animate({
        opacity: "0"
    }, 150, function() {
        window.location = destination + ".html";
    });
});
