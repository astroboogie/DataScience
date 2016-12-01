// Page Leave Transition
$(".button-object").click(function () {
    var clickedObject = $(this);

    var destination = clickedObject.attr('id').split("-")[1];
    console.log(destination);

    $("body > *").not("body > #background-container").animate({
        opacity: "0"
    }, 150, function() {
        window.location = destination + ".html";
    });

    // $("body").animate({
    //     marginLeft: "-100vw"
    // }, 200, function() {
    //     window.location = destination + ".html";
    // });

});