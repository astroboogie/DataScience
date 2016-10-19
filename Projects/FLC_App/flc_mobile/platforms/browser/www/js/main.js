var body = $("#body-container");
var header = $("#header-container");

body.scroll(function () {

    if (this.scrollTop > 50) {
        header.addClass("header-scaled");
    } else {
        header.removeClass("header-scaled");
    }

});