import $ from 'jquery';

// Page Leave Transition
const applyBackTransition = function() {
    $("#back-arrow").click(function () {
        $("body > *").animate({
            opacity: "0"
        }, 150, function() {
            window.location = "index.html";
        });
    });
}

export { applyBackTransition };
