// // Disable Horizontal Scrolling
// $(function() {
//
//     var $body = $(document);
//     $body.bind('scroll', function() {
//         // "Disable" the horizontal scroll.
//         if ($body.scrollLeft() !== 0) {
//             $body.scrollLeft(0);
//         }
//     });
//
// });

// fast Click
$(function() {
    FastClick.attach(document.body);
});

// Header Slider
var body = $(".body-container");
var header = $("#header-container");

body.scroll(function () {
    var scrollText = $("#counter");
    var currPos = this.scrollTop;

    scrollText.text(currPos);

    if (this.scrollTop > 62) {
        header.addClass("header-scaled");
    } else {
        header.removeClass("header-scaled");
    }

});

// Subject Button Click
var subjectButton = $("#subject");
var scheduleContainer = $("#schedule-container");
var scheduleCategories = $("#schedule-categories");
var bodyContainer = $(".body-container");
// $("#category-back").prop('disabled', true);

// creates subject debounce
var subjectPage = false;

var selectedVal;

// Creates function to slide schedule page
var categorySlide = function () {
    scheduleContainer.addClass("container-scaled");
    scheduleCategories.addClass("categories-scaled");
    // bodyContainer.removeClass("overflow-locked");
};

// Creates function that unslides schedule page
var categoryUnslide = function () {
    scheduleContainer.removeClass("container-scaled");
    scheduleCategories.removeClass("categories-scaled");
    // bodyContainer.addClass("overflow-locked");

    $(".body-container").scrollTop(0);
};

// runs categorySlide when subjectButton is clicked
subjectButton.click(function () {
    subjectPage = true;
    categorySlide();
});

// runs categoryUnslide when back button is pressed
$("#category-back").click(function () {
    if (subjectPage == true) {
        subjectPage = false;
        categoryUnslide();
    }
    else {
        window.location = "index.html";
    }
});

// Gets which week radio button is checked, adds background and gets value
var totalLabels = $("#weekdays").children("form").children("label");

$('#weekdays input').on('change', function() {
    var selectionLabel = $(this).parent().children("span");

    if (selectionLabel.css('background-color') == "rgb(220, 220, 220)") {
        selectionLabel.css('background-color', 'rgb(255, 255, 255)');
    }
    else {
        selectionLabel.css('background-color', 'rgb(220, 220, 220)');
    }
});

// Configure/Contents Clicker
var configureButton = $("#configure");
var contentsButton = $("#contents");

var configureContainer = $("#configure-container");
var courseContainer = $("#course-container");

var confToggled = true;

var clickToggle = function(clicked, unclicked, configure, courses) {
    clicked.addClass("category-selected");
    unclicked.removeClass("category-selected");

    configureContainer.removeClass();
    courseContainer.removeClass();

    configureContainer.addClass(configure);
    courseContainer.addClass(courses);
};

configureButton.click(function () {
    if (confToggled == false) {
        confToggled = true;
        clickToggle(configureButton, contentsButton, "category-zero", "category-push");
    }
});

contentsButton.click(function () {
    if (confToggled == true) {
        confToggled = false;
        clickToggle(contentsButton, configureButton, "category-pull", "category-zero");
    }
});

// organize items dictionary (example currently)
var course = {};

// creates list of course titles
var courseTitles = [];

$.getJSON("classesOut.json", function(data) {

    // creates course list
    $.each(data, function(index, element) {
        $(element).each(function (i) {
            // creates course list
            course["course" + i] = element[i];

            // creates course title
            var selectedTitle = element[i]["courseTitle"];
            var titleName = selectedTitle.split(" ")[0];
            if (courseTitles.indexOf(titleName) == -1) {
                courseTitles.push(titleName);

                // creates schedule categories
                $("#schedule-categories").append("<button class='category-container'><div class='category-text'><span>" + titleName + "</span></div></button>")

            }
        });
    });

})
.done(function() {

    var categoryButton = $(".category-container");
    var subjectText = $("#subject-text");

    // Updates text values when one of the categories in the subject list is clicked
    categoryButton.click(function () {
        selectedVal = $(this).children('div').children('span').text();
        subjectText.text(selectedVal);

        subjectPage = false;
        categoryUnslide();

    });
    // updates course listing on courses button click
    $("#contents").click(function() {
        $("#course-container").empty();

        for (var key in course) {
            var title = course[key]["courseTitle"];
            var className = course[key]["courseName"];

            var tempCourseTitle = title.split(" ")[0];

            if (tempCourseTitle == selectedVal) {
                $("#course-container").append("<div class='category' id='" + key + "'><div class='category-body'><div class='category-header'><span class='course-title'>" + title + " " + className + "</span></div><div class='category-description'><span class='course-days'>MoWeFri</span><span class='course-time'>9:00am - 10:20am</span></div></div><button class='category-star'><i class='material-icons'>keyboard_arrow_right</i></button></div>")

                var currContainer = $("#" + key);

                var containerHeight = currContainer.find(".category-body").height();

                currContainer.find(".category-star").height(containerHeight);

            }
        }

        if ($('#course-container').is(':empty')) {
            $("#course-container").append("<div id='empty-results'><i class='material-icons'>block</i></br><span>There are no course results listed</span></div>")
        }

        // Star Click
        var starButton = $(".category-star");

        starButton.click(function () {
            $(this).children('i').toggleClass("starToggle");
        });
    })
});