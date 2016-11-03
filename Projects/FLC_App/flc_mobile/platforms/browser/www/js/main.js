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
var subjectButton = $("#subject-object");
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
    
    categoryUnslide();
});