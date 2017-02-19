import $ from 'jquery';
import '../css/index.css';
import '../css/native_app_configuration.css';
import '../css/material-icons.css';
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
    if (clickedObject.attr('id').indexOf('-') > -1) {
        var destination = clickedObject.attr('id').split("-")[1];

        $("body > *").not("body > #background-container").animate({
            opacity: "0"
        }, 150, function () {
            window.location = destination + ".html";
        });
    }
});

var twitterCheck = function () {
    var scheme;

    if (device.platform == 'iOS') {
        scheme = 'twitter://';
    }
    else if (device.platform === 'Android') {
        scheme = 'com.twitter.android';
    }

    appAvailability.check(
        scheme, // URI Scheme
        function() {  // Success callback
            window.open('twitter://user?screen_name=flcfalcons', '_system', 'location=no');
        },
        function() {  // Error callback
            window.open("https://twitter.com/flcfalcons", '_system');
        }
    );
};

var facebookCheck = function () {
    var scheme;

    if (device.platform == 'iOS') {
        scheme = 'fb://';
    }
    else if (device.platform === 'Android') {
        scheme = 'com.facebook.katana';
    }

    appAvailability.check(
        scheme, // URI Scheme
        function() {  // Success callback
            window.open('fb://profile/folsomlakecollege', '_system', 'location=no');
        },
        function() {  // Error callback
            window.open("https://www.facebook.com/folsomlakecollege/", '_system');
        }
    );
};

$("#twitter").click(function () {
    twitterCheck();
});

$("#facebook").click(function () {
    facebookCheck();
});