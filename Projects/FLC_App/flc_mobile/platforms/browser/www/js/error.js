import '../css/error.css';
import '../css/material-icons.css';

const errorPage = function(div) {
    $(div).append(
        "<div id='error'>\
            <div id='error-container'>\
                <i class='material-icons'>error</i>\
                <span>Error fetching data.</span>\
            </div>\
        </div>"
    );
}

export { errorPage };
