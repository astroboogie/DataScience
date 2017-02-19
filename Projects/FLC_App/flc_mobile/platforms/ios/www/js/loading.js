import '../css/loading.css';

const displayLoadingSpinner = function() {
    $("body").append(
        '<div class="spinner-container">\
            <div class="spinner"></div>\
        </div>'
    );
}

const fadeOutLoadingSpinner = function(timer) {
    $("body .spinner-container").fadeOut(timer, function() {
        $("body .spinner-container").remove();
    });
}

export { displayLoadingSpinner, fadeOutLoadingSpinner };
