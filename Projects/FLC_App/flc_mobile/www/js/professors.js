var instructors;
var currentPage = "search";
var backSelectable = true;

var searchText = $("#search-text");
var searchInput = $("#search-text > input");

var professorUpdate = function (characters) {

    $("#professor-container").empty();

    $.each(instructors, function(index, element) {
        if (characters == "ten&limit") {
            $("#professor-container").append("<div class='course-object'><div class='course-text-container'><div class='professor-title'><span>" + element + "</span></div><div class='professor-description'><div class='professor-status'>Full-time</div><div class='professor-subject'>Mathematics</div></div><div class='professor-email'><span>tullyg@flc.losrios.edu</span></div></div><div class='professor-arrow'><i class='material-icons'>keyboard_arrow_right</i></div></div>")
        }
        else if (element.toLowerCase().indexOf(characters.toLowerCase()) > -1) {
            $("#professor-container").append("<div class='course-object'><div class='course-text-container'><div class='professor-title'><span>" + element + "</span></div><div class='professor-description'><div class='professor-status'>Full-time</div><div class='professor-subject'>Mathematics</div></div><div class='professor-email'><span>tullyg@flc.losrios.edu</span></div></div><div class='professor-arrow'><i class='material-icons'>keyboard_arrow_right</i></div></div>")
        }
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

            professorUpdate("ten&limit");

            setTimeout(function(){
                professorUpdate("");
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
    professorUpdate("empty");
};

$.getJSON("classesOut.json", function(data) {

    instructors = data['instructors'];

}).done(function() {

    // generates subject list
    professorUpdate("");

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
    professorUpdate("");

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
        professorUpdate(searchInput.val());
    }

    if (searchInput.val().length <= 0) {
        professorUpdate("");
    }

});