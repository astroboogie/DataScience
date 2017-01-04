import '../css/error';

const errorPage = function(div) {
    $(div).append(
        "<div id='error-container'>\
            <i class='material-icons fa-exclamation-circle'></i>\
            <span>Error fetching data.</span>\
        </div>"
    );
}

export { errorPage };
