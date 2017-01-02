import $ from 'jquery';
import FastClick from 'fastclick';

// fast Click
const applyFastClick = function() {
    $(function() {
        FastClick.attach(document.body);
    });
}

export { applyFastClick };
