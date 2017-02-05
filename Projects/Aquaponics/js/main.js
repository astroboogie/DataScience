var slideShowTexts = [
    "<div class='slideshow-object slide-0'><span class='slideshow-text'>The Aquaponics Project</span></div>",
    "<div class='slideshow-object slide-1'><span class='slideshow-text'>What does “Aquaponics” mean?</span></div>",
    "<div class='slideshow-object slide-2'><span class='slideshow-text'><strong>Aqua</strong>culture - raising aquatic animals </br>+ </br>Hydro<strong>ponics</strong> - cultivating plants in water</br>=</br><strong>Aquaponics</strong></span></div>",
    "<div class='slideshow-object slide-3'><span class='slideshow-text'>Several Slides of the Nitrogen Cycle (building to the nitrogen cycle diagram)</span></div>",
    "<div class='slideshow-object slide-4'><span class='slideshow-text'>Fish and aquatic animals produce waste containing ammonia (NH<sub>3</sub>)</span></div>",
    "<div class='slideshow-object slide-5'><span class='slideshow-text'>Ammonia in high concentrations is toxic to fish</span></div>",
    "<div class='slideshow-object slide-6'><span class='slideshow-text'>Nitrosomonas bacteria convert ammonia into nitrites (NO<sub>2</sub><sup>-</sup>)</span></div>",
    "<div class='slideshow-object slide-7'><span class='slideshow-text'>Nitrobacter bacteria convert nitrates into nitrites (NO<sub>3</sub><sup>-</sup>)</span></div>",
    "<div class='slideshow-object slide-8'><span class='slideshow-text'>Nitrates are taken up by plants through their roots as nourishment, completing the cycle</span></div>",
    "<div class='slideshow-object slide-9'><span id='small-font' class='credits slideshow-text'>The Aquaponics Project is brought to you by:</br></br>The Departments of Biology and Chemistry</br></br>The Folsom Lake College Library</br></br>Installation design, development, and construction provided by the FLC Theater Arts Department</br></br>Aquatic community development provided by Taylor Zenobia and ?</br></br>Programming and technical implementation provided by the FLC Data Science ClubThe Folsom Lake College Innovation Center</span></div>"
];

var transitionBoolean = false;

window.onload = function start() {
    slide();

    $(document).keypress(function(e) {
        if(e.which == 13) {
            if (transitionBoolean == false) {
                graphTransition();
            }
        }
    });
};

function fadeOut (slidenum) {
    $(".slide-" + slidenum).children().removeClass("transition-in");
    removeSlide(slidenum);
}

function fadeIn (slidenum) {
    $(".slide-" + slidenum).children().addClass("transition-in");
}

function removeSlide (slidenum) {
    window.setTimeout(function() {
        $(".slide-" + slidenum).remove()
    }, 0);
}

function createSlide (slidenum) {
    $("#slideshow-container").append(slideShowTexts[slidenum]);

    var currentSlide =  $(".slide-" + slidenum);
    var textHeight = currentSlide.children().height();
    var slideshowHeight = $("#slideshow-container").height();
    currentSlide.css("margin-top", (slideshowHeight * 0.4) - (textHeight / 2.4));
    fadeIn(slidenum);
}

function slide() {
    var currentSlide = 0;
    window.setInterval(function () {

        var oldSlide = $(".slide-" + currentSlide);
        var newSlide = $(".slide-" + (currentSlide + 1));

        fadeOut(currentSlide);

        if (currentSlide == slideShowTexts.length) {
            createSlide(0);
            currentSlide = 0;
            return;
        }
        else {
            createSlide(currentSlide + 1);
        }

        currentSlide += 1;
    }, 5000);
}

function graphTransition() {
    transitionBoolean = true;
    $("#main-container").addClass("container-transition");
    $("#graph-container").addClass("graph-transition");

    returnTransition();
}

function returnTransition() {
    window.setTimeout(function() {
        transitionBoolean = false;
        $("#main-container").removeClass("container-transition");
        $("#graph-container").removeClass("graph-transition");
    }, 9999999);
}