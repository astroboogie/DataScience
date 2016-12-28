var currentPage = "search";
var backSelectable = true;

var searchText = $("#search-text");
var searchInput = $("#search-text > input");

$.ajax({
    url: "https://s3-us-west-1.amazonaws.com/flc-app-data/instructors.json",
    type: "GET",
    success: function(data) {
        createProfessors(data);
    },
});

// Creates a div for each professor and appends it to the
// professor-container div.
var createProfessors = function (professors) {
    $.each(professors, function(index, element) {
        let name = element["name"];
        let email = element["email"] || "";
        let phone = element["phone"] || "";
        let subjects = createSubjectList(element["subjects"], 3);
        let status = determineProfessorStatus(element["classHours"], element["classList"]);

        $("#professor-container").append(professorInfo(name, status, subjects, email, phone));
    });

    // Adds professor-arrow click-functionality to view
    // more in-depth professor information.
    $(".professor-arrow").click(function () {
        backSelectable = true;
        currentPage = "professor-overlay";
        professorPage(this);
    });
};

// Returns a string representation of a list of subjects
// up to the designated maximum.
var createSubjectList = function(subjects, max = 99) {
    if (subjects.length > max) {
        return subjects.slice(0, max).join(", ") + "…";
    }
    return subjects.join(", ");
}

// Returns a string indicating the professor's status
// hours is passed in as a string of the form "8hr 50min"
var determineProfessorStatus = function(hours, classlist) {
    let parsedHours = parseInt(hours.substring(0, hours.indexOf('hr')));
    if (parsedHours >= 8 || classlist.length >= 6) {
        return "Full-time";
    }
    return "Part-time";
}

// Returns a div outlining the professor's information
var professorInfo = function(name, status, subjects, email, phone) {
    return ("\
        <div class='course-object'>\
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
                <div class='professor-info'>\
                    <span>" + phone + "</span>\
                </div>\
            </div>\
            <div class='professor-arrow'>\
                <i class='material-icons'>keyboard_arrow_right</i>\
            </div>\
        </div>"
    );
}

var filterProfessors = function(search, professorDivs) {
    $.each(professorDivs.children('div'), function(index, element) {
        name = $(element).find($(".course-text-container > .professor-title > span")).text();
        subjects = $(element).find($(".course-text-container > .professor-info > .professor-subject > span")).text();
        if (cleanString(name + subjects).indexOf(cleanString(search)) !== -1) {
            $(element).removeClass("course-object-hide");
        }
        else {
            $(element).addClass("course-object-hide");
        }
    });
}

// Removes all punctuation and makes all characters lowercase
var cleanString = function(string) {
    if (typeof(string) !== "string") {
        return "";
    }
    return string.replace(/[^a-z]/ig,'').toLowerCase();
}

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
        $("#professor-overlay").removeClass("transition-professor-overlay");
        $("#professor-container").removeClass("transition-professor-container");
        $("#header-search").removeClass("professor-scaled");
        $("#header-text").removeClass("header-text-scaled");
    }
};

var professorPage = function(object) {
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
};

// back arrow functionality
$(function () {
    $("#back-arrow").click(function () {
        if (backSelectable) {
            backArrowPress(currentPage);
        }
    });
});

// sets width of text inputs to placeholder length
var setIntputTextWidth = function() {
    $("input[placeholder]").each(function () {
        $(this).attr('size', $(this).attr('placeholder').length);
    });
}

// Resets container widths to pixel equivalents
var resetContainerWidth = function() {
    searchText.css("width", searchText.width());
}

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
}

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
        filterProfessors("", $("#professor-container"));
    });
}

// Updates search results upon key press
var createUpdateSearchResultsHandler = function() {
    searchInput.keyup(function() {
        if (searchInput.val().length > 0) {
            filterProfessors(searchInput.val(), $("#professor-container"));
        }
        else {
            filterProfessors("", $("#professor-container"));
        }
    });
}

setIntputTextWidth();
resetContainerWidth();
createSearchHeaderTransitionOnClick();
createSearchHeaderCancelTransitionOnClick();
createUpdateSearchResultsHandler();
