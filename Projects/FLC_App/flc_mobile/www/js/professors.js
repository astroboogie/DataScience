var instructors;
var currentPage = "search";
var backSelectable = true;

var searchText = $("#search-text");
var searchInput = $("#search-text > input");

var professorUpdate = function (professors) {
    //$("#professor-container").empty();
    $.each(professors, function(index, element) {
        let professorName = element["name"]
        let professorEmail = element["email"] || ""
        let professorPhone = element["phone"] || ""
        let professorSubjects
        // If the professor has too many subjects, limit their list to 3
        if (element["subjects"].length > 3) {
            element["subjects"] = element["subjects"].slice(0, 3)
            professorSubjects = element["subjects"].join(", ") + "…";
        }
        else {
            professorSubjects = element["subjects"].join(", ");
        }
        let professorStatus = ""
        let professorHours = element["classHours"];
        professorHours = parseInt(professorHours.substring(0, professorHours.indexOf('hr')));
        if (professorHours >= 8 || element["classList"].length >= 6) {
            professorStatus = "Full-time";
        }
        else {
            professorStatus = "Part-time";
        }

        $("#professor-container").append("\
            <div class='course-object'>\
                <div class='course-text-container'>\
                    <div class='professor-title'>\
                        <span>" + professorName + "</span>\
                    </div>\
                    <div class='professor-info'>\
                        <div class='professor-status'>\
                            <span>" + professorStatus + "</span>\
                        </div>\
                        <div class='professor-subject'>\
                            <span>" + professorSubjects + "</span>\
                        </div>\
                    </div>\
                    <div class='professor-info'>\
                        <span>" + professorEmail + "</span>\
                    </div>\
                    <div class='professor-info'>\
                        <span>" + professorPhone + "</span>\
                    </div>\
                </div>\
                <div class='professor-arrow'>\
                    <i class='material-icons'>keyboard_arrow_right</i>\
                </div>\
            </div>");
    });

    $(".professor-arrow").click(function () {
        backSelectable = true;
        currentPage = "professor-overlay";
        professorPage(this);
    });
};

var backArrowPress = function(pageSet) {
    if (backSelectable == true) {
        if (pageSet == "search") {
            $("body > *").animate({
                opacity: "0"
            }, 150, function() {
                window.location = "index.html";
            });
        }
        else if (pageSet == "professor-overlay") {
            currentPage = "search";
            $("#professor-overlay").removeClass("transition-professor-overlay");
            $("#professor-container").removeClass("transition-professor-container");
            $("#header-search").removeClass("professor-scaled");
            $("#header-text").removeClass("header-text-scaled");

            //professorUpdate("ten&limit");

            setTimeout(function(){
                //professorUpdate("");
            }, 300);
        }
    }
};

var professorPage = function(object) {

    console.log($(object).parent());
    var professorTitle = $(object).parent().find($(".professor-title > span")).text();
    var professorStatus = $(object).parent().find($(".professor-status")).text();
    var professorSubject = $(object).parent().find($(".professor-subject")).text();
    var professorEmail = $(object).parent().find($(".professor-email > span")).text();

    // updates page content
    $("#header-title > span").text("Professor " + professorTitle);
    $("#professor-type > span").text(professorStatus);
    $("#professor-subject > span").text(professorSubject);
    $("#professor-email > span").text(professorEmail);

    // add header transitions
    $("#professor-overlay").addClass("transition-professor-overlay");
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

    // remove search bar content
    searchInput.val("");
    //professorUpdate("empty");
};

let url = "https://s3-us-west-1.amazonaws.com/flc-app-data/instructors.json";
$.ajax({
    url: url,
    type: "GET",
    success: function(data) {
        professorUpdate(data);
    },
});

// back arrow functionality
$(function () {
    $("#back-arrow").click(function () {
        if (currentPage == "search") {
            backArrowPress("search");
        }
        else if (currentPage == "professor-overlay") {
            backArrowPress("professor-overlay");
        }
    });
});

// sets width of of text inputs to placeholder length
$("input[placeholder]").each(function () {
    $(this).attr('size', $(this).attr('placeholder').length);
});

// Resets container widths to pixel equivalents
searchText.css("width", searchText.width());

// Creates transitions when the search bar is clicked
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

// Removes transitions when the search cancel button is clicked
$("#cancel-button").click(function () {

    searchInput.val("");
    //professorUpdate("");

    backSelectable = true;

    $("#back-arrow").removeClass("transition-back-arrow");
    $("#header-search").removeClass("transition-header-search");
    $("#search-text-container").removeClass("transition-search-text-container");
    $("#search-icon > i").removeClass("transition-search-icon");
    $("#cancel-button-container").removeClass("transition-cancel-button-container");
    $("#cancel-button > span").removeClass("transition-cancel-button");
});

// Updates search results upon key press
searchInput.keyup(function() {
    if (searchInput.val().length > 0) {
        //professorUpdate(searchInput.val());
    }

    if (searchInput.val().length <= 0) {
        //professorUpdate("");
    }
});
