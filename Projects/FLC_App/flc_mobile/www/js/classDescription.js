import $ from 'jquery';
import '../css/classDescription.css';

// Arrow is a jquery div that will be given an onClick event.
// Div is the location that the class overlay will be appended to
const addAppendClassOverlayOnClick = function(arrow, div, classes, courses) {
    $(arrow).click(function () {
        let id = $(this).parent().attr("id").replace(/[^\/\d]/g,''); // remove non-digits
        let curClass = classes[id];
        let course = $.grep(courses, function(course) {
            return course["courseTitle"] === curClass["courseTitle"];
        })[0];

        let classTime = curClass["lecTime"] || curClass["labTime"];
        let classLocation = curClass["lecRoom"] || curClass["labRoom"];
        let coursePrerequisite = course["prerequisite"] || "None.";
        let courseCorequisite = course["corequisite"] || "None.";
        let courseAdvisory = course["advisory"] || "None.";
        let generalEducation = course["generalEducation"] || "None.";

        // adds course details
        appendClassOverlay(
            $(div),
            course["courseTitle"],
            course["courseName"],
            curClass["classNum"],
            course["units"],
            course["transferableTo"],
            curClass["instructor"],
            curClass["days"],
            classTime,
            classLocation,
            curClass["schedule"],
            coursePrerequisite,
            courseCorequisite,
            courseAdvisory,
            generalEducation,
            course["description"]
        );
    });
}

function appendClassOverlay(div, title, courseName, num, units, transfer, professor, days, time, location, schedule, prereq, coreq, advisory, genEd, description) {
    $(div).empty();
    $(div).append("\
        <div id='course-overlay-container'>\
            <div id='course-overlay-border'></div>\
            <div id='course-overlay-header'>\
                <div id='course-overlay-icon'>\
                    <img src='img/education-icon.png'>\
                </div>\
                <div id='course-overlay-title'>\
                    <div id='title-flex'>\
                        <div id='course-title-container'>\
                            <span>" + title + ": " + courseName + "</span>\
                        </div>\
                        <div id='course-title-description'>\
                            <span id='course-number'>" + num + "</span>\
                            <span id='course-units'>" + units + "</span>\
                            <span id='course-overlay-transfer'>" + transfer + "</span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id='course-overlay-body'>\
                <div id='course-body-container'>\
                    <div class='course-body-section'>\
                        <div id='overlay-professor'>" + professor + "</div>\
                        <div id='overlay-timedate'>" + days + " " + time + "</div>\
                    </div>\
                    <div class='course-body-section'>\
                        <div id='overlay-location'><strong>Location: </strong><span>" + location + "</span></div>\
                        <div id='overlay-schedule'><strong>Schedule: </strong><span>" + schedule + "</span></div>\
                    </div>\
                    <div class='course-body-section'>\
                        <div id='overlay-prerequisites'><strong>Prerequisite: </strong><span>" + prereq + "</span></div>\
                        <div id='overlay-corequisites'><strong>Corequisites: </strong><span>" + coreq + "</span></div>\
                        <div id='overlay-advisory'><strong>Advisory: </strong><span>" + advisory + "</span></div>\
                        <div id='overlay-generaled'><strong>General Education: </strong><span>" + genEd + "</span></div>\
                    </div>\
                </div>\
            </div>\
            <div id='course-overlay-footer'>\
                <div id='course-footer-header'>Description</div>\
                <span id='course-overlay-description'>" + description + "</span>\
            </div>\
        </div>"
    );
}

export { addAppendClassOverlayOnClick };
