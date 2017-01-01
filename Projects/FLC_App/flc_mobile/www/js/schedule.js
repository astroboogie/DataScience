import $ from 'jquery';
import '../css/schedule.css';
import '../css/schedule-subpages.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import '../lib/font-awesome.min.css';
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { applyFastClick } from './fastclick';

applyFastClick();

var subjects;
var courses;
var selectedSubject;
var currentPage = "schedule";

$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/subjects.json",
    type: "GET",
    success: function(data) {
        subjects = $.extend({}, data); // copies data into subjects
        createSubjectsList("#subjects", subjects);
    },
});

$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/courses.json",
    type: "GET",
    success: function(data) {
        courses = $.extend([], data); // copies data into subjects
    },
});

var createSubjectsList = function(div, subjects) {
    $.each(subjects, function(subjectAbbrev, subjectReadable) {
        $(div).append(
            "<button class='category-container'>\
                <div class='category-text'>\
                    <span>" + subjectReadable + "</span>\
                </div>\
            </button>"
        );
    });
}

// Scrolls between pages
var pageTransition = function (direction, initPage, newPage) {
    if (direction == "new") {
        $("#" + initPage).addClass("hide-container");
        $("#" + newPage).addClass("show-container");
    }
    else if (direction == "back") {
        $("#" + initPage).removeClass("hide-container");
        $("#" + newPage).removeClass("show-container")
    }

};

$("#subject-button").click(function () {
    currentPage = "subjects";
    pageTransition("new", "body-section", "subjects");
});

// Creates all back arrow functionality
$("#back-arrow").click(function () {
    if (currentPage == "schedule") {
        $("body > *").animate({
            opacity: "0"
        }, 150, function () {
            window.location = "index.html";
        });
    }
    else if (currentPage == "subjects") {
        $("#body-section").scrollTop(0);
        currentPage = "schedule";
        pageTransition("back", "body-section", "subjects");
    }
    else if (currentPage == "courses") {
        $("#body-section").scrollTop(0);
        currentPage = "schedule";
        pageTransition("back", "body-section", "courses");
    }
    else if (currentPage == "description") {
        $("#courses").addClass("show-container");
        $("#courses").removeClass("course-full-transition");
        currentPage = "courses";
        pageTransition("back", "courses", "course-overlay");
        $("#header-text > span").text("Browse Courses");
    }
});

// Returns true if any of the selected days matches a class days
// Returns true if class days have not been determined
var hasValidDayConditions = function(checkBoxes, days) {
    if (days === "TBA") {
        return true
    }
    let ret = false;
    $(checkBoxes).each(function() {
        if (days.indexOf($(this).val()) != -1) {
            ret = true;
            return;
        }
    });
    return ret;
}

// Returns true if there are no conflicts between the set conditions
// and the course itself.
var hasValidCourseType = function(classTypeInputs, curClass) {
    let ret = true;
    $(classTypeInputs).each(function() {
        // condition to check if course is fast track
        let isFastTrackCourse = (curClass["schedule"].indexOf("Eight") != -1);
        if ($(this).val() === "Fast Track" && !isFastTrackCourse) {
            ret = false;
            return;
        }

        // condition to check if course is online
        let isOnlineCourse = (curClass["classType"] === "Online")
        if ($(this).val() === "Online" && !isOnlineCourse) {
            ret = false;
            return;
        };
    });
    return ret;
}

// Returns a string containing the html representation of a course
var courseInfo = function(classId, courseTitle, courseName, courseType, days, time, instructor, room) {
    return ("\
        <div id='" + classId + "' class='course-object'>\
            <div class='course-text-container'>\
                <div class='course-title'>\
                    <span>" + courseTitle + ": " + courseName + courseType + "</span>\
                </div>\
                <div class='course-description'>\
                    <div class='course-days'>" + days + "</div>\
                    <div class='course-time'>" + time + "</div>\
                    <div class='course-professor'>" + instructor + "</div>\
                </div>\
                <div class='course-location'>\
                    <span>" + room + "</span>\
                </div>\
            </div>\
            <div class='course-arrow'>\
                <i class='material-icons'>keyboard_arrow_right</i>\
            </div>\
        </div>\
    ");
}


// TODO: This ajax call NEEDS to wait for the previous one to finish
$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/classes.json",
    type: "GET",
    success: function(data) {
        createTransitionFromSubjectToSchedule();
        // Assign function to 'search' button that transitions page from schedule to list of courses
        // Also create the page when the 'search' button is clicked
        $("#search-button").click(function () {
            currentPage = "courses";
            pageTransition("new", "body-section", "courses");
            resetSearchResults($("#courses"));
            createSearchResults($("#courses"), data);
            createCourseFullDescription($(".course-arrow"), data, courses);
        });
    },
});

// Transitions the subjects list page to the main schedule page
// Returns a string of the selected subject
var createTransitionFromSubjectToSchedule = function() {
    $(".category-container").click(function() {
        selectedSubject = $(this).children('div').children('span').text();
        $("#subject-text").children('span').text(selectedSubject);
        currentPage = "schedule";
        pageTransition("back", "body-section", "subjects");
    });
}

var resetSearchResults = function(div) {
    $(div).empty();
}

var createSearchResults = function(div, classes) {
    $.each(classes, function(index, element) {
        // Check that each class is the same as the selected subjects
        // e.g. that all classes are "Anthopology"
        let courseTitleAbbrev = subjects[element['courseTitle'].split(" ")[0]];
        let isCorrectSubject = (courseTitleAbbrev === selectedSubject);
        if (!isCorrectSubject) {
            return "continue"; //jQuery version of continue
        }

        if (hasValidDayConditions($("#day-form > form > label > input:checked"), element['days'])
            && hasValidCourseType("#type-container > div > form > label > input:checked", element)
            ) {
            // Grab lec/lab type
            let room = element['labRoom'] || element['lecRoom'];
            let time = element['labTime'] || element['lecTime'];
            let courseType = element['labTime'] ? " LAB" : "";
            $(div).append(courseInfo(element['id'], element['courseTitle'], element['courseName'], courseType, element['days'], time, element['instructor'], room));
        }
    });
    // Display error message if search result is empty.
    if ($(div).is(':empty')) {
        $(div).append("<div id='course-empty'><div id='empty-container'><i class='material-icons'>block</i><span>No classes found</span></div></div> ")
    }
}

// Adds an on_click event to an arrow that creates the entire course description
var createCourseFullDescription = function(arrow, classes, courses) {
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
        $("#title-container > span").text(course["courseTitle"] + ": " + course["courseName"]);
        $("#course-number").text(curClass["classNum"]);
        $("#course-units").text(course["units"] + " Units");
        $("#overlay-transfer").text(course["transferableTo"]);

        $("#overlay-professor").text("Professor " + curClass["instructor"]);
        $("#overlay-timedate").text(curClass["days"] + " " + classTime);
        $("#overlay-location > span").text(classLocation);
        $("#overlay-schedule > span").text(course["schedule"]);
        $("#overlay-corequisites > span").text(courseCorequisite);
        $("#overlay-prerequisites > span").text(coursePrerequisite);
        $("#overlay-advisory > span").text(courseAdvisory);
        $("#overlay-generaled > span").text(generalEducation);
        $("#overlay-description > span").text(course["description"]);

        // adds transitions
        currentPage = "description";
        $("#header-text > span").text("Course Description");
        $("#courses").removeClass("show-container");
        $("#courses").addClass("course-full-transition");
        pageTransition("new", "courses", "course-overlay");
    });
}
