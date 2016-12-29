var subjects = {};
var classes = [];

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

// Transitions page from schedule page to subject list
var currentPage = "schedule";

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

$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/subjects.json",
    type: "GET",
    success: function(data) {
        $.each(data, function(index, element) {
            $.each(element, function(key, value) {
                subjects[key] = value;
                $("#subjects").append(
                    "<button class='category-container'>\
                        <div class='category-text'>\
                            <span>" + value + "</span>\
                        </div>\
                    </button>"
                );
            });
        });
    },
});

$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/classes.json",
    type: "GET",
    success: function(data) {
        classes = data;
    },
});

// Transitions the subjects list page to the main schedule page
// Returns a string of the selected subject
var transitionFromSubjectToSchedule = function() {
    $(".category-container").click(function() {
        selectedSubject = $(this).children('div').children('span').text();
        $("#subject-text").children('span').text(selectedSubject);
        currentPage = "schedule";
        pageTransition("back", "body-section", "subjects");
    });
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
}

// Returns true if there are no conflicts between the set conditions
// and the course itself.
var hasValidCourseType = function(classTypeInputs, schedule, labRoom, lecRoom) {
    let ret = true;
    $(classTypeInputs).each(function() {
        // condition to check if course is fast track
        let isFastTrackCourse = (schedule.indexOf("Eight") != -1);
        if ($(this).val() == "Fast Track" && !isFastTrackCourse) {
            ret = false;
            return;
        }

        // condition to check if course is online
        let isOnlineCourse = ($(this).val() == "Online");
        let isLecOnline = (lecRoom && (lecRoom.indexOf("ONLINE") != -1));
        let isLabOnline = (labRoom && (labRoom.indexOf("ONLINE") != -1));
        if (isOnlineCourse) {
            if ((lecRoom != null) && !isLecOnline) {
                ret = false;
                return;
            }
            if ((labRoom != null) && !isLabOnline) {
                ret = false;
                return;
            }
        }
    });
    return ret;
}

// Returns a string containing the html representation of a course
var courseInfo = function(classNum, courseTitle, courseName, courseType, days, time, instructor, room) {
    return ("\
        <div id='" + classNum + "' class='course-object'>\
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

// Adds an on_click event to an arrow that creates the entire course description
var createCourseFullDescription = function(arrow, classes) {
    $(arrow).click(function () {
        var currentId = $(this).parent().attr("id").replace(/[^\/\d]/g,''); // remove non-digits

        var currentCourse = classes[currentId][0];
        var currentTopic = classes[currentId][1];

        var courseTime = currentCourse["lecTime"] || currentCourse["labTime"];
        var courseLocation = currentCourse["lecRoom"] || currentCourse["labRoom"];
        var coursePrerequisite = currentTopic["prerequisite"] || "None.";
        var courseCorequisite = currentTopic["corequisite"] || "None.";
        var courseAdvisory = currentTopic["advisory"] || "None.";

        // adds course details
        $("#title-container > span").text(currentTopic["courseTitle"] + ": " + currentTopic["courseName"]);
        $("#course-number").text(currentCourse["classNum"]);
        $("#course-units").text(currentTopic["units"] + " Units");
        $("#overlay-transfer").text(currentTopic["transferableTo"]);

        $("#overlay-professor").text("Professor " + currentCourse["instructor"]);
        $("#overlay-timedate").text(currentCourse["days"] + " " + courseTime);
        $("#overlay-location > span").text(courseLocation);
        $("#overlay-schedule > span").text(currentCourse["schedule"]);
        $("#overlay-corequisites > span").text(courseCorequisite);
        $("#overlay-prerequisites > span").text(coursePrerequisite);
        $("#overlay-advisory > span").text(courseAdvisory);
        $("#overlay-generaled > span").text(currentTopic["generalEducation"]);
        $("#overlay-description > span").text(currentTopic["description"]);

        // adds transitions
        currentPage = "description";
        $("#header-text > span").text("Course Description");
        $("#courses").removeClass("show-container");
        $("#courses").addClass("course-full-transition");
        pageTransition("new", "courses", "course-overlay");
    });
}

var selectedSubject;
// TODO: This ajax call NEEDS to wait for the previous one to finish
$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/courses.json",
    type: "GET",
    success: function(data) {
        transitionFromSubjectToSchedule();
        console.log(selectedSubject);
        // Assign function to 'search' button that transitions page from schedule to list of courses
        $("#search-button").click(function () {
            currentPage = "courses";
            pageTransition("new", "body-section", "courses");

            var tempClasses = {};

            // Create courses divs based on search criteria
            $("#courses").empty();
            $.each(data, function(index, element) {
                // check if currentTitle is the same as the selectedSubject
                let currentTitle = element['courseTitle'].split(" ")[0];
                if (subjects[currentTitle] == selectedSubject) {
                    $.each(element['classes'], function(key, value) {
                        if (hasValidDayConditions($("#day-form > form > label > input:checked"), value['days'])
                            && hasValidCourseType("#type-container > div > form > label > input:checked", value["schedule"], value["labRoom"], value["lecRoom"])) {
                            // Grab lec/lab type
                            let room = value['labRoom'] || value['lecRoom'];
                            let time = value['labTime'] || value['lecTime'];
                            let courseType = value['labTime'] ? " LAB" : "";

                            tempClasses[value['classNum']] = [value, element];

                            $("#courses").append(courseInfo(value['classNum'], element['courseTitle'], element['courseName'], courseType, value['days'], time, value['instructor'], room));
                        }
                    });
                }
            });
            // Display error message if search result is empty.
            if( $("#courses").is(':empty') ) {
                $("#courses").append("<div id='course-empty'><div id='empty-container'><i class='material-icons'>block</i><span>No classes found</span></div></div> ")
            }
            createCourseFullDescription($(".course-arrow"), tempClasses);
        });
    },
});
