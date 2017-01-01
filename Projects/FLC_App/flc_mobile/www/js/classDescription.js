import $ from 'jquery';
import '../css/classDescription.css';

const appendClassDescriptionOverlay = function(div, title, courseName, num, units, transfer, professor, days, time, location, schedule, prereq, coreq, advisory, genEd, description) {
    $(div).empty();
    $(div).append("\
        <div id='overlay-container'>\
            <div id='overlay-border'></div>\
            <div id='overlay-header'>\
                <div id='overlay-icon'>\
                    <img src='img/education-icon.png'>\
                </div>\
                <div id='overlay-title'>\
                    <div id='title-flex'>\
                        <div id='title-container'>\
                            <span>" + title + ": " + courseName + "</span>\
                        </div>\
                        <div id='title-description'>\
                            <span id='course-number'>" + num + "</span>\
                            <span id='course-units'>" + units + "</span>\
                            <span id='overlay-transfer'>" + transfer + "</span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id='overlay-body'>\
                <div id='body-container'>\
                    <div class='body-section'>\
                        <div id='overlay-professor'>" + professor + "</div>\
                        <div id='overlay-timedate'>" + days + " " + time + "</div>\
                    </div>\
                    <div class='body-section'>\
                        <div id='overlay-location'><strong>Location: </strong><span>" + location + "</span></div>\
                        <div id='overlay-schedule'><strong>Schedule: </strong><span>" + schedule + "</span></div>\
                    </div>\
                    <div class='body-section'>\
                        <div id='overlay-prerequisites'><strong>Prerequisite: </strong><span>" + prereq + "</span></div>\
                        <div id='overlay-corequisites'><strong>Corequisites: </strong><span>" + coreq + "</span></div>\
                        <div id='overlay-advisory'><strong>Advisory: </strong><span>" + advisory + "</span></div>\
                        <div id='overlay-generaled'><strong>General Education: </strong><span>" + genEd + "</span></div>\
                    </div>\
                </div>\
            </div>\
            <div id='overlay-footer'>\
                <div id='footer-header'>Description</div>\
                <span id='overlay-description'>" + description + "</span>\
            </div>\
        </div>"
    );
}

export { appendClassDescriptionOverlay };
