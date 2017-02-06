// Transition delay in seconds
var graphTransitionTime = 3;
var slideTransitionTime = 2;
var fadeTime = 0.5;

var cycleType;

if ($(window).height() < $(window).width()) {
    cycleType = "cycle-wide";
}
else {
    cycleType = "cycle-tall";
}

var slideShowTexts = [
    "<span class='slideshow-text'>The Aquaponics Project</span>",
    "<span class='slideshow-text'>What does “Aquaponics” mean?</span>",
    "<span class='slideshow-text'><strong>Aqua</strong>culture - raising aquatic animals </br>+ </br>Hydro<strong>ponics</strong> - cultivating plants in water</br>=</br><strong>Aquaponics</strong></span>",
    "<span class='slideshow-text'><div id='cycle' class=" + cycleType + "></div></span>",
    "<span class='slideshow-text'>Fish and aquatic animals produce waste containing ammonia (NH<sub>3</sub>)</span>",
    "<span class='slideshow-text'>Ammonia in high concentrations is toxic to fish</span>",
    "<span class='slideshow-text'>Nitrosomonas bacteria convert ammonia into nitrites (NO<sub>2</sub><sup>-</sup>)</span>",
    "<span class='slideshow-text'>Nitrobacter bacteria convert nitrates into nitrites (NO<sub>3</sub><sup>-</sup>)</span>",
    "<span class='slideshow-text'>Nitrates are taken up by plants through their roots as nourishment, completing the cycle</span>",
    "<span id='small-font' class='slideshow-text'>The Aquaponics Project is brought to you by:</br></br>The Departments of Biology and Chemistry</br></br>The Folsom Lake College Library</br></br>Installation design, development, and construction provided by the FLC Theater Arts Department</br></br>Aquatic community development provided by Taylor Zenobia and ?</br></br>Programming and technical implementation provided by the FLC Data Science ClubThe Folsom Lake College Innovation Center</span>"
];

var transitionBoolean = false;

window.onload = function start() {
    $(document).keypress(function(e) {
        if(e.which == 13) {
            if (transitionBoolean == false) {
                graphTransition();
            }
        }
    });
};

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
    }, graphTransitionTime * 1000);
}

var currentSlide = 0;

window.setInterval(function () {
    var slideContainer = $("#slideshow-container");
    var slideText = slideContainer.children();

    if (currentSlide != slideShowTexts.length - 1) {
        currentSlide += 1;
    }
    else {
        currentSlide = 0;
    }
    
    slideText.fadeOut(fadeTime * 1000, function() {
        slideText.remove();
        slideContainer
            .html(slideShowTexts[currentSlide])
            .children()
            .fadeOut(0)
            .fadeIn(fadeTime * 1000);
        });

}, slideTransitionTime * 1000);