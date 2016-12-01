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

var subjects = {};
var classes = [];

var selectedSubject;

// Retrieves json data
$.getJSON("classesOut.json", function(data) {

    classes = data['classes'];
    
    // generates subject list
    $.each(data['subjects'], function(index, element) {
        $.each(element, function(key, value) {
            subjects[key] = value;
            $("#subjects").append("<button class='category-container'><div class='category-text'><span>" + value + "</span></div></button>")
        });
    });

}).done(function () {

    // Creates subject page buttons
    $(".category-container").click(function() {
        selectedSubject = $(this).children('div').children('span').text();
        $("#subject-text").children('span').text(selectedSubject);
        currentPage = "schedule";
        pageTransition("back", "body-section", "subjects");
    });
    
    // Transitions page from schedule to courses
    $("#search-button").click(function () {

        currentPage = "courses";
        pageTransition("new", "body-section", "courses");

        var tempClasses = {};

        $("#courses").empty();

        $.each(classes, function(index, element) {
            // check if currentTitle is the same as the selectedSubject
            var currentTitle = element['courseTitle'].split(" ")[0];
            if (subjects[currentTitle] == selectedSubject) {
                $.each(element['classTimes'], function(key, value) {

                    // Condition to be met throughout all search conditions
                    var invalid = true;

                    // Day conditions
                    $("#day-form > form > label > input:checked").each(function() {
                        if (value['days'].indexOf($(this).val()) > -1) {
                            invalid = false;
                        }
                        if (value['days'] == "TBA") {
                            invalid = false;
                        }
                    });

                    // Course Type conditions
                    if (invalid == false) {
                        $("#type-container > div > form > label > input:checked").each(function() {
                            var fastTrackCourse = false;
                            var onlineCourse = false;

                            // condition to check if course is fast track
                            if (value["schedule"].indexOf("Eight") != -1) {
                                fastTrackCourse = true;
                            }

                            // condition to check if course is online
                            if (value["labRoom"] != null) {
                                if (value["labRoom"].indexOf("ONLINE") != -1) {
                                    onlineCourse = true;
                                }
                            }
                            if (value["lecRoom"] != null) {
                                if (value["lecRoom"].indexOf("ONLINE") != -1) {
                                    onlineCourse = true;
                                }
                            }

                            // creates checkbox statements to match previous conditions
                            if ($(this).val() == "Fast Track" && fastTrackCourse == false) {
                                invalid = true;
                            }
                            else if ($(this).val() == "Online" && onlineCourse == false) {
                                invalid = true;
                            }
                        });
                    }

                    // Finalizes course append
                    if (invalid == false) {
                        
                        // Grab lec/lab type
                        var selectedTime;
                        var selectedRoom;
                        var courseType;

                        if (value['labTime'] == null) {
                            selectedTime = value['lecTime'];
                            selectedRoom = value['lecRoom'];
                            courseType = "";
                        }
                        else if (value['lecTime'] == null) {
                            selectedTime = value['labTime'];
                            selectedRoom = value['labRoom'];
                            courseType = " LAB";
                        }

                        var tempKey = value['classNum'];
                        tempClasses[tempKey] = [value, element];

                        $("#courses").append("<div id=' " + value['classNum'] + " ' class='course-object'><div class='course-text-container'><div class='course-title'><span>" + element['courseTitle'] + ": " + element['courseName'] + courseType + "</span></div><div class='course-description'><div class='course-days'>" + value['days'] + "</div><div class='course-time'>" + selectedTime + "</div><div class='course-professor'>" + value['instructor'] + "</div></div><div class='course-location'><span>" + selectedRoom + "</span></div></div><div class='course-arrow'><i class='material-icons'>keyboard_arrow_right</i></div></div>")
                    }

                })
            }
        });

        if( $("#courses").is(':empty') ) {
            $("#courses").append("<div id='course-empty'><div id='empty-container'><i class='material-icons'>block</i><span>No classes found</span></div></div> ")
        }


            // creates course full description functionality
        $(".course-arrow").click(function () {
            var currentId = $(this).parent().attr("id").replace(/[^\/\d]/g,'');

            var currentCourse = tempClasses[currentId][0];
            var currentTopic = tempClasses[currentId][1];

            var courseTime;
            var courseLocation;
            var coursePrerequisite = currentTopic["prerequisite"];
            var courseCorequisite = currentTopic["corequisite"];
            var courseAdvisory = currentTopic["advisory"];
            
            if (currentTopic["corequisite"] == null) {
                courseCorequisite = "None.";
            }

            if (currentTopic["prerequisite"] == null) {
                coursePrerequisite = "None.";
            }

            if (currentTopic["advisory"] == null) {
                courseAdvisory = "None.";
            }

            if (currentCourse["labRoom"] == null) {
                courseTime = currentCourse["lecTime"];
                courseLocation = currentCourse["lecRoom"];
            }
            else if (currentCourse["lecRoom"] == null) {
                courseTime = currentCourse["labTime"];
                courseLocation = currentCourse["labRoom"];
            }

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

    });
});