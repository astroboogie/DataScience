var currentTime = {
    hour: 01,
    minute: 00,
    period: "AM"
};

var parsedTime;

var scrollPosition;

$(".time-object").scroll(function () {
    var currentPosition = $(this).scrollTop();
    var divHeight = $(this).children("div").height();
    var currentDiv = Math.round(currentPosition / divHeight);
    var currentDivValue = $(this).children("div").eq(currentDiv + 2).text();
    var timeSection = $(this).attr("id");
    scrollPosition = currentDiv * divHeight;

    currentTime[timeSection] = currentDivValue;

    parsedTime = currentTime["hour"] + ":" + currentTime["minute"] + " " + currentTime["period"];

    // console.log(currentTime);

});

$(".time-object").mouseleave(function () {
    if (scrollPosition != null) {
        // console.log("scroll");
        $(this).animate({
            scrollTop: scrollPosition
        }, {
            duration: 80,
            start: function() {
                scrollPosition = null;
                if (parsedTime.length == 1) {
                    console.log(parsedTime);
                    $("#header-text > span").text("0" + parsedTime);
                }
                else {
                    $("#header-text > span").text(parsedTime);
                }
            }
        })
    }
});