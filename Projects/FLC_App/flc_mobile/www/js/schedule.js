import $ from 'jquery';
import '../css/schedule.css';
import '../css/schedule-subpages.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import { fetchData } from './fetchData';
import { applyFastClick } from './fastclick';
import { addAppendClassOverlayOnClick } from './classDescription';
import { setSemesterValues } from './semesters';
import { displayLoadingSpinner, fadeOutLoadingSpinner } from './loading';
import { errorPage } from './error';

applyFastClick();

var cache = {
    "subjects": {},
    "courses": {},
    "classes": {},
};
var currentPage = "schedule";

setSemesterValuesOnPageLoad();
function setSemesterValuesOnPageLoad() {
    displayLoadingSpinner();
    fetchData("semesters")
        .done(function(semesterData) {
            setSemesterValues("#schedule-semester-form", semesterData);
            fadeOutLoadingSpinner(250);
        })
        .fail(fadeOutLoadingSpinner(250));
}

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

function handleSubjects (data) {
    fadeOutLoadingSpinner(250);
    currentPage = "subjects";
    pageTransition("new", "body-section", "subjects");
    createSubjectsList("#subjects", data);
}

function handleSearchResultsAJAX(coursesData, classesData) {
    handleSearchResults(coursesData[0], classesData[0]);
}

function handleSearchResults(coursesData, classesData) {
    currentPage = "courses";
    pageTransition("new", "body-section", "courses");
    resetSearchResults($("#courses"));
    createSearchResults($("#courses"), classesData);
    createCourseFullDescription($(".course-arrow"), $("#course-overlay"), classesData, coursesData);
}

// Assign function to 'search' button that transitions page from schedule to list of courses.
// Also create the search results page when the 'search' button is clicked.
createSearchButtonFunctionailty()
function createSearchButtonFunctionailty() {
    $("#search-button").click(function () {
        let semester = getSemesterRadioVal();
        if (cache["courses"][semester] && cache["classes"][semester]) {
            handleSearchResults(cache["courses"][semester], cache["classes"][semester]);
        }
        else {
            displayLoadingSpinner();
            $.when(fetchData("courses", semester), fetchData("classes", semester))
                .done(function(coursesData, classesData) {
                    cache["courses"][semester] = coursesData[0];
                    cache["classes"][semester] = classesData[0];
                    handleSearchResults(coursesData[0], classesData[0]);
                    fadeOutLoadingSpinner(250);
                })
                .fail(handleSearchResultsError);
        }
    });
}

function handleSearchResultsError() {
    fadeOutLoadingSpinner(250);
    currentPage = "courses";
    pageTransition("new", "body-section", "courses");
    $("#courses").empty();
    errorPage("#courses");
}

function handleSubjectError() {
    fadeOutLoadingSpinner(250);
    currentPage = "subjects";
    pageTransition("new", "body-section", "subjects");
    $("#subjects").empty();
    errorPage("#subjects");
}

function getSemesterRadioVal() {
    return $("#schedule-semester-form input[type='radio']:checked").val();
}

// Creates search arrow functionality
function transitionToSubjectsListOnClick(button) {
    $(button).click(function () {
        let semester = getSemesterRadioVal();
        if (cache["subjects"][semester]) {
            handleSubjects(cache["subjects"][semester]);
        }
        else {
            displayLoadingSpinner();
            fetchData("subjects", semester)
                .done(handleSubjects)
                .done(function(data) {
                    cache["subjects"][semester] = data;
                })
                .fail(handleSubjectError);
        }
    });
}
transitionToSubjectsListOnClick("#subject-button")

function createSubjectsList(div, subjects) {
    $(div).empty();
    $.each(subjects, function(subjectAbbrev, subjectReadable) {
        $(div).append(
            "<button class='category-container'>\
                <div class='category-text'>\
                    <span>" + subjectReadable + " (" + subjectAbbrev + ")</span>\
                </div>\
            </button>"
        );
    });
    createTransitionFromSubjectToSchedule();
}

// Scrolls between pages
function pageTransition(direction, initPage, newPage) {
    if (direction == "new") {
        $("#" + initPage).addClass("hide-container");
        $("#" + newPage).addClass("show-container");
    }
    else if (direction == "back") {
        $("#" + initPage).removeClass("hide-container");
        $("#" + newPage).removeClass("show-container")
    }
}

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
};

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
        let isOnlineCourse = (curClass["classType"] === "Online");
        if ($(this).val() === "Online" && !isOnlineCourse) {
            ret = false;
            return;
        }
    });
    return ret;
};

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
};

// Transitions the subjects list page to the main schedule page
// after having selected a subject.
function createTransitionFromSubjectToSchedule() {
    $(".category-container").click(function() {
        let selectedSubject = $(this).children('div').children('span').text();
        $("#subject-text").children('span').text(selectedSubject);
        currentPage = "schedule";
        pageTransition("back", "body-section", "subjects");
    });
};

var resetSearchResults = function(div) {
    $(div).empty();
};

var createSearchResults = function(div, classesData) {
    // Extract the subject's abbreviated name (the text between the parenthesis).
    let parenthesesRegExp = /\(([^)]+)\)/;
    let subjectMatch = parenthesesRegExp.exec($("#subject-text").children('span').text());
    let curSubject = subjectMatch && subjectMatch[1] || '';
    let semester = getSemesterRadioVal();
    $.each(classesData, function(index, element) {
        // Check that each class is the same as the selected subjects
        // e.g. that all classes are "Anthopology"
        let courseTitle = element['courseTitle'].split(" ")[0];
        let isCorrectSubject = (courseTitle === curSubject);
        if (!isCorrectSubject) {
            return "continue"; //jQuery version of continue
        }
        else if (hasValidDayConditions($("#day-form > form > label > input:checked"), element['days'])
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
        $(div).append("<div id='course-empty'><div id='empty-container'><i class='material-icons'>block</i><span>No classes found.</span></div></div>")
    }
};

// Adds an on_click event to an arrow that creates the entire course description
var createCourseFullDescription = function(arrow, div, classesData, coursesData) {
    addAppendClassOverlayOnClick($(arrow), $(div), classesData, coursesData);
    // adds transitions
    $(arrow).click(function () {
        currentPage = "description";
        $("#header-text > span").text("Course Description");
        $("#courses").removeClass("show-container");
        $("#courses").addClass("course-full-transition");
        pageTransition("new", "courses", "course-overlay");
    });
};
