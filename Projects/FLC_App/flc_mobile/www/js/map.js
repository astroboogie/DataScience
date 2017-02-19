import $ from 'jquery';
import '../css/map.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import { applyFastClick } from './fastclick';
import { applyBackTransition } from './backtransition';

applyBackTransition();
applyFastClick();

// $(document).ready(function() {
//     // are we running in native app or in a browser?
//     window.isphone = false;
//     if(document.URL.indexOf("http://") === -1
//         && document.URL.indexOf("https://") === -1) {
//         window.isphone = true;
//     }
//     if( window.isphone ) {
//         onDeviceReady();
//     }
// });
//
// function onDeviceReady() {
//     alert("works");
//     L.mapbox.accessToken = 'pk.eyJ1IjoiZGF0YXNjaWVuY2UiLCJhIjoiY2l5eGU3cDJ2MDBiYTJ3cG0ydWZtejNobCJ9.X4DsnvOJVX83b_Yascwsrg';
//     var map = L.mapbox.map('map', 'mapbox.streets')
//         .setView([38.662, -121.127], 17.47);
// }

L.mapbox.accessToken = 'pk.eyJ1IjoiZGF0YXNjaWVuY2UiLCJhIjoiY2l5eGU3cDJ2MDBiYTJ3cG0ydWZtejNobCJ9.X4DsnvOJVX83b_Yascwsrg';
var map = L.mapbox.map('map', 'mapbox.streets')
    .setView([38.662, -121.127], 17.47);
