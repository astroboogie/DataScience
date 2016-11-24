// Page Leave Transition
$(".button-object").click(function () {
    var clickedObject = $(this);

    var destination = clickedObject.attr('id').split("-")[1];
    console.log(destination);

    $("#background-container").animate({
        opacity: "1"
    }, 150);

    $("body > *").not("body > #background-container").animate({
        opacity: "0"
    }, 150, function() {
        window.location = destination + ".html";
    });

});