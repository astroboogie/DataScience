import $ from 'jquery';
import '../css/professors.css';
import '../css/mobileView.css';
import '../css/professors_subpages.css';
import '../css/native_app_configuration.css';
import '../fonts/material-icons.css';
import { displayLoadingSpinner, fadeOutLoadingSpinner } from './loading';
import { fetchData } from './fetchData';
import { applyFastClick } from './fastclick';
import { setSemesterValues } from './semesters';
import { addAppendClassOverlayOnClick } from './classDescription';
import { errorPage } from './error';

applyFastClick();

var cache = {
    "courses": {},
    "classes": {},
};
var currentPage = "search";
var backSelectable = true;
var searchText = $("#search-text");
var searchInput = $("#search-text > input");

fetchDataAndCreatePage();
function fetchDataAndCreatePage() {
    displayLoadingSpinner();
    $.when(fetchData("semesters",), fetchData("instructors"))
        .done(function(semesterData, instructorData) {
            setSemesterValues("#professor-semester-form", semesterData[0]);
            updateProfessorClassListOnSemesterChange(instructorData[0]);
            createProfessors("#professor-container", instructorData[0]);
            fadeOutLoadingSpinner(250);
        })
        .fail(handleCreateProfessorsError);
}

// Creates a div for each professor and appends it to the given div.
function createProfessors(div, professors) {
    $.each(professors, function(index, professor) {
        $(div).append(professorInfo(professor));
    });
    // Adds professor-arrow click-functionality to view
    // more in-depth professor information.
    $(".professor-arrow").click(function () {
        backSelectable = true;
        currentPage = "professor-overlay";
        createProfessorOverlay(this, professors);

        // transition page to professor overlay
        $("#professor-overlay").addClass("transition-professor-overlay-center");
        $("#professor-container").addClass("transition-professor-container");
        $("#header-search").addClass("professor-scaled");
        $("#header-text").addClass("header-text-scaled");

        // reset search bar
        $("#back-arrow").removeClass("transition-back-arrow");
        $("#header-search").removeClass("transition-header-search");
        $("#search-text-container").removeClass("transition-search-text-container");
        $("#search-icon > i").removeClass("transition-search-icon");
        $("#cancel-button-container").removeClass("transition-cancel-button-container");
        $("#cancel-button > span").removeClass("transition-cancel-button");
    });
}

function getProfessorsClassList(professorID, professors, semester) {
    let classListSemester = "classList_" + semester;
    return professors[professorID][classListSemester];
}

function updateProfessorClassListOnSemesterChange(professors) {
    $("#professor-semester-form input[type='radio']").change(function() {
        let semester = getSemesterRadioVal();
        let professorID = $(this).closest("form").attr("professor-id").replace(/[^\/\d]/g,''); // remove non-digit
        let classList = getProfessorsClassList(professorID, professors, semester);
        if (cache["classes"][semester] && cache["courses"][semester]) {
            createProfessorClassList(classList, cache["courses"][semester], cache["classes"][semester]);
        }
        else {
            displayLoadingSpinner();
            $.when(fetchData("courses", semester), fetchData("classes", semester))
                .done(function(coursesData, classesData) {
                    fadeOutLoadingSpinner(250);
                    createProfessorClassList(classList, coursesData[0], classesData[0]);
                    cache["courses"][semester] = coursesData[0];
                    cache["classes"][semester] = classesData[0];
                })
                .fail(handleProfessorClassListError);
        }
    });
}

function handleCreateProfessorsError() {
    fadeOutLoadingSpinner(250);
    $("#professor-container").empty();
    errorPage("#professor-container");
}

function handleProfessorClassListError() {
    //fadeOutLoadingSpinner(250);
    $("#course-container").empty();
    errorPage("#course-container");
}

function getSemesterRadioVal() {
    return $("#professor-semester-form input[type='radio']:checked").val();
}

// Returns a string representation of a list of subjects
// up to the designated maximum.
var createSubjectList = function(subjects, max = 99) {
    if (subjects.length > max) {
        return subjects.slice(0, max).join(", ") + "…";
    }
    return subjects.join(", ");
};

// Returns a string indicating the professor's status.
// hours is passed in as a string of the form "8hr 50min"
var determineProfessorStatus = function(hours, classlist) {
    let parsedHours = parseInt(hours.substring(0, hours.indexOf('hr')));
    if (parsedHours >= 8) {
        return "Full-time";
    }
    return "Part-time";
};

function generateEmail(professorName) {
    var nameContainer = professorName.split(" ");
    if (nameContainer.length == 2) {
        return nameContainer[1].substring(0, 6).toLowerCase() + nameContainer[0].substring(0, 1).toLowerCase() + "@flc.losrios.edu";
    }
    else {
        return "";
    }
}

// Returns a div outlining the professor's information
var professorInfo = function(professor) {
    let name = professor["name"];
    let id = professor["id"];
    let email = professor["email"] || generateEmail(name);
    let phone = professor["phone"] || "";
    let subjects = createSubjectList(professor["subjects"], 3);
    let status = determineProfessorStatus(professor["classHours"], professor["classList"]);
    return ("\
        <div id='" + id + "' class='course-object'>\
            <div class='course-text-container'>\
                <div class='professor-title'>\
                    <span>" + name + "</span>\
                </div>\
                <div class='professor-info'>\
                    <div class='professor-status'>\
                        <span>" + status + "</span>\
                    </div>\
                    <div class='professor-subject'>\
                        <span>" + subjects + "</span>\
                    </div>\
                </div>\
                <div class='professor-info'>\
                    <span>" + email + "</span>\
                </div>\
            </div>\
            <div class='professor-arrow'>\
                <i class='material-icons'>keyboard_arrow_right</i>\
            </div>\
        </div>"
    );
};

var createProfessorOverlay = function(arrow, professors) {
    let semester = getSemesterRadioVal();
    var professorTitle = $(arrow).parent().find($(".professor-title > span")).text();
    var professorStatus = $(arrow).parent().find($(".professor-status")).text();
    var professorSubject = $(arrow).parent().find($(".professor-subject")).text();
    var professorEmail = $(arrow).parent().find($(".professor-email > span")).text();

    // updates page content
    $("#header-title > span").text("Professor " + professorTitle);
    $("#professor-type > span").text(professorStatus);
    $("#professor-subject > span").text(professorSubject);
    $("#professor-email > span").text(professorEmail);

    let professorID = $(arrow).parent().attr("id").replace(/[^\/\d]/g,''); // remove non-digit;
    $("#professor-semester-form").attr('professor-id', professorID);
    let classList = getProfessorsClassList(professorID, professors, semester);
    if (cache["courses"][semester] && cache["classes"][semester]) {
        createProfessorClassList(classList, cache["courses"][semester], cache["classes"][semester]);
    }
    else {
        displayLoadingSpinner();
        $.when(fetchData("courses", semester), fetchData("classes", semester))
            .done(function(coursesResponse, classesResponse) {
                cache["courses"][semester] = coursesResponse[0];
                cache["classes"][semester] = classesResponse[0];
                createProfessorClassList(classList, coursesResponse[0], classesResponse[0]);
                fadeOutLoadingSpinner(250);
            })
            .fail(handleProfessorClassListError);
    }
};

function createProfessorClassList(classList, courses, classes) {
    $("#course-container").empty();
    $(classList).each(function (index, id) {
        $("#course-container").append(professorClass(classes[id]));
    });
    if ($("#course-container").is(':empty')) {
        $("#course-container").append(emptyClassList());
    }
    addAppendClassOverlayOnClick($(".course-arrow"), $("#course-overlay"), classes, courses);
    $(".course-arrow").click(function () {
        currentPage = "description";
        $("#professor-overlay").removeClass("transition-professor-overlay-center");
        $("#professor-overlay").addClass("transition-professor-overlay-left");
        $("#header-text > span").text("Course Description");
        $("#course-overlay").addClass("transition-course-overlay");
    });
}

// back arrow functionality
$(function () {
    $("#back-arrow").click(function () {
        if (currentPage == "search") {
            backArrowPress("search");
        }
        else if (currentPage == "professor-overlay") {
            backArrowPress("professor-overlay");
        }
        else if (currentPage == "description") {
            backArrowPress("description");
        }
    });
});

var filterProfessors = function(search, professorDivs) {
    $.each($(professorDivs).children('div'), function(index, element) {
        let name = $(element).find($(".course-text-container > .professor-title > span")).text();
        let subjects = $(element).find($(".course-text-container > .professor-info > .professor-subject > span")).text();
        if (cleanString(name + subjects).indexOf(cleanString(search)) !== -1) {
            $(element).css("display", "block");
        }
        else {
            $(element).css("display", "none");
        }
    });
};

// Removes all punctuation and makes all characters lowercase
var cleanString = function(string) {
    if (typeof(string) !== "string") {
        return "";
    }
    return string.replace(/[^a-z]/ig,'').toLowerCase();
};

var backArrowPress = function(pageSet) {
    if (pageSet == "search") {
        $("body > *").animate({
            opacity: "0"
        }, 150, function() {
            window.location = "index.html";
        });
    }
    else if (pageSet == "professor-overlay") {
        currentPage = "search";
        $("#professor-overlay").removeClass("transition-professor-overlay-center");
        $("#professor-container").removeClass("transition-professor-container");
        $("#header-search").removeClass("professor-scaled");
        $("#header-text").removeClass("header-text-scaled");
    }
    else if (pageSet == "description") {
        currentPage = "professor-overlay";
        $("#professor-overlay").removeClass("transition-professor-overlay-left");
        $("#professor-overlay").addClass("transition-professor-overlay-center");
        $("#course-overlay").removeClass("transition-course-overlay");
        $("#header-text > span").text("Professor");
    }
};

// Returns a string representation of html corresponding to a professor's classes
var professorClass = function(classData) {
    let id = classData["id"];
    let courseTitle = classData["courseTitle"];
    let courseName = classData["courseName"];
    let days = classData["days"];
    let time = classData["lecTime"] || classData["labTime"];
    let location = classData["lecRoom"] || classData["labRoom"];
    return ("\
        <div id='" + id + "' class='course-object'>\
            <div class='course-text-container'>\
                <div class='course-title'>\
                    <span>" + courseTitle + " : " + courseName + "</span>\
                </div>\
                <div class='course-description'>\
                    <div class='course-days'>" + days + "</div>\
                    <div class='course-time'>" + time + "</div>\
                </div>\
                <div class='course-location'>\
                    <span>" + location + "</span>\
                </div>\
            </div>\
            <div class='course-arrow'>\
                <i class='material-icons'>keyboard_arrow_right</i>\
            </div>\
        </div>"
    );
};

// sets width of text inputs to placeholder length
var setIntputTextWidth = function() {
    $("input[placeholder]").each(function () {
        $(this).attr('size', $(this).attr('placeholder').length);
    });
};

// Resets container widths to pixel equivalents
var resetContainerWidth = function() {
    searchText.css("width", searchText.width());
};

// Creates transitions when the search bar is clicked
var createSearchHeaderTransitionOnClick = function() {
    $("#header-search").click(function () {
        backSelectable = false;

        $("#back-arrow").addClass("transition-back-arrow");
        $("#header-search").addClass("transition-header-search");
        $("#search-text-container").addClass("transition-search-text-container");
        $("#search-icon > i").addClass("transition-search-icon");
        $("#cancel-button-container").addClass("transition-cancel-button-container");
        $("#cancel-button > span").addClass("transition-cancel-button");

        searchInput.focus();
    });
};

// Removes transitions when the search cancel button is clicked
var createSearchHeaderCancelTransitionOnClick = function() {
    $("#cancel-button").click(function () {
        backSelectable = true;

        $("#back-arrow").removeClass("transition-back-arrow");
        $("#header-search").removeClass("transition-header-search");
        $("#search-text-container").removeClass("transition-search-text-container");
        $("#search-icon > i").removeClass("transition-search-icon");
        $("#cancel-button-container").removeClass("transition-cancel-button-container");
        $("#cancel-button > span").removeClass("transition-cancel-button");

        searchInput.val("");
        filterProfessors("", "#professor-container");
    });
};

// Updates search results upon key press
var createUpdateSearchResultsHandler = function() {
    searchInput.keyup(function() {
        if (searchInput.val().length > 0) {
            filterProfessors(searchInput.val(), "#professor-container");
        }
        else {
            filterProfessors("", "#professor-container");
        }
    });
};

function emptyClassList() {
    return ("\
        <div id='professor-classlist-empty'>\
            <div id='professor-classlist-empty-container'>\
                <i class='material-icons'>block</i>\
                <span>No classes found.</span>\
            </div>\
        </div>\
    ");
}

setIntputTextWidth();
resetContainerWidth();
createSearchHeaderTransitionOnClick();
createSearchHeaderCancelTransitionOnClick();
createUpdateSearchResultsHandler();
