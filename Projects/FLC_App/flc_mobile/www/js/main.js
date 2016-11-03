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

// Header Slider
var body = $(".body-container");
var header = $("#header-container");

body.scroll(function () {
    var scrollText = $("#counter");
    var currPos = this.scrollTop;
    console.log(currPos);

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
// $("#category-back").prop('disabled', true);

// creates subject debounce
var subjectPage = false;

// Creates function to slide schedule page
var categorySlide = function () {
    scheduleContainer.addClass("container-scaled");
    scheduleCategories.addClass("categories-scaled");

    // $("#category-back").prop('disabled', false);
    // $("#category-back").addClass("enable-opacity");

};

// Creates function that unslides schedule page
var categoryUnslide = function () {
    $("input").prop('disabled', true);
    scheduleContainer.removeClass("container-scaled");
    scheduleCategories.removeClass("categories-scaled");
    // $("#category-back").removeClass("enable-opacity");

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

var categoryButton = $(".category-container");
var subjectText = $("#subject-text");
var selectedVal;

// Updates text values when one of the categories in the subject list is clicked
categoryButton.click(function () {
    selectedVal = $(this).children('div').children('span').text();
    subjectText.text(selectedVal);

    subjectPage = false;
    categoryUnslide();
});

// Gets which week radio button is checked, adds background and gets value
var totalLabels = $("#weekdays").children("form").children("label");

$('#weekdays input').on('change', function() {
    totalLabels.css('background-color', 'white');
    
    var selectionLabel = $(this).parent().parent();
    selectionLabel.css('background-color', '#EDEDED');

    console.log($(this).prop("value"));
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

// Star Click
var starButton = $(".category-star");

starButton.click(function () {
    console.log("cat");
    $(this).children('i').toggleClass("starToggle");
});

// Append course data to generated elements

var courseData = "https://cdn.rawgit.com/AstroBoogie/DataScience/master/Projects/FLC_App/app_data/classesOut.json";
var items = [];

var success = function () {
    console.log("cat");
};

var jqxhr = $.getJSON( "classesOut.json", function() {
    console.log( "success" );
})
    .done(function() {
        console.log( "second success" );
    })
    .fail(function() {
        console.log( "error" );
    })
    .always(function() {
        console.log( "complete" );
    });

// Perform other work here ...


// $.getJSON("blabla.json", function(data) {
//
//     // loop through data, parse it into items dictionary
//
//     // organize items dictionary (example currently)
//     var course = {
//         course1 : [
//             "PHIL 300",
//             "Introduction to Philosophy",
//             "MoWeFri",
//             "9:00am - 10:20am"
//         ],
//         course2 : [
//             "PHIL 310",
//             "Introduction to Ethics",
//             "TuThu",
//             "1:00pm - 3:00pm"
//         ]
//     };
//
//     // organize courses dictionary into course container objects
//     for (i = 0, i < data.length, i++) {
//         $( "<div/>", {
//             class: "course-title",
//             text: (course["course" + i][0] + course["course" + i][1])
//         }).appendTo("#course-container");
//     }
//
// });