
// Developed by Nathaniel Adams for Breakthrough Listen and the Berkeley SETI Research Center
var selectedStar;

// Selected .fits data for angstrom conversion
var angstromArray = "fits/angstrom_conversion.txt";

// creates array to store fits data
var localReducedArray;
var localRawArray;

// creates maximum and minimum starting values
var rmax = 0;
var rmin = 100000;

// creates arrays for storing data throughout generateRaw
var rawDataStore = [];
var dataStoreLocation = [];
var rawDataMagnified = {};
var rawMagnifyCounter = -1;

// compresses data by a factor of the value
var xCompress = 49;
var yCompress = 50;

// creates array to contain arrays of pixel-to-angstrom conversions
var angstromStore = [];

// sets width and height of svg container
var max_x = $(window).width();
var max_y;

max_y = (max_x - ((max_x / 7) * 2) / 0.7);

// creates conditional max_y for responsive design
// if (max_x >= 1900) {
//     max_y = $(window).height() * screenRatio * 0.9;
// }
// else if (max_x >= 1360) {
//     max_y = $(window).height() * screenRatio * 0.2;
// }
// else {
//     max_y = $(window).height();
// }

// adds margins surrounding svg container
var margin = {
    top: 50,
    right: max_x / 7,
    bottom: 0,
    left: max_x / 7
};
var width = max_x - margin.left - margin.right,
    height = max_y - margin.top - margin.bottom;

// defines the length of the row based on the length of the compressed list within the original fits data
var rawCropLength;

var cropLength;

// array storage for magnified data
var magMainStore;

// array storage for magnified data in the graph 2 viewport
var magViewStore;

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

$.fn.textWidth = function(){
    var html_org = $(this).html();
    var html_calc = '<span>' + html_org + '</span>';
    $(this).html(html_calc);
    var width = $(this).find('span:first').width();
    $(this).html(html_org);
    return width;
};

var starSelected = false;

function linkCheck(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', "fits/r" + url + ".txt", false);
    http.send();
    return http.status!=404;
}
$("input").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();

        var $inputs = $('.form :input');

        $inputs.each(function() {
            selectedStar = $(this).val();
        });

        if (linkCheck(selectedStar) == false) {
            d3.select(".error")
                .style("opacity", 1);
        }
        else {
            console.log("worked");
            starSelected = true;
            cacheImport();

            d3.selectAll(".graphbutton")
                .style("opacity", 1);

            d3.selectAll(".bigtext")
                .style("opacity", 1);

            d3.selectAll(".name")
                .style("opacity", 1);

            d3.select(".error")
                .style("opacity", 0);

            $(".form").remove();
        }
    }
});

$("#mySub").on("click", function() {

    var $inputs = $('.form :input');

    $inputs.each(function() {
        selectedStar = $(this).val();
    });

    if (linkCheck(selectedStar) == false) {
        d3.select(".error")
            .style("opacity", 1);
    }
    else {
        starSelected = true;
        cacheImport();

        d3.selectAll(".graphbutton")
            .style("opacity", 1);

        d3.selectAll(".bigtext")
            .style("opacity", 1);

        d3.selectAll(".name")
            .style("opacity", 1);

        d3.select(".error")
            .style("opacity", 0);

        $(".form").remove();
    }

});

var cacheImport = function() {

    // Selected .fits data for reduced graph (must be json-readable 2-dimensional array)
    var reducedGraphArray = "fits/r" + selectedStar + ".txt";

    var split = selectedStar.split(".");

    // Selected .fits data for raw graph
    var rawGraphArray = "fits/ucb-" + split[0] + split[1] + ".txt";

    // caches raw and reduced 2 dimensional arrays
    d3.json(rawGraphArray, function(data) {

        // creates a loop to compress data based on xCompress and yCompress
        var cropCheck = false;
        for (var x = 0; x < data.length; x++) {
            for (var y = 0; y < data[x].length; y++) {
                var item = data[x][y];

                // iterates at a rate of yCompress and xCompress
                if (y % yCompress == 0 && x % xCompress == 0) {

                    // sets max and min values of the total data
                    if (rawDataStore[item] > rmax) {
                        rmax = rawDataStore[item];
                    }
                    if (rawDataStore[item] < rmin) {
                        rmin = rawDataStore[item];
                    }

                    // stores every compressed data item into rawDataStore
                    rawDataStore.push(item);

                    // stores the array and position of each item relative to an index
                    dataStoreLocation.push({
                        "array": x,
                        "position": y
                    });

                    // iterates the rawMagnifyCounter value
                    rawMagnifyCounter++;

                    rawDataMagnified[rawMagnifyCounter] = [];
                }

                // stores all magnified data points in far right nodes
                rawDataMagnified[rawMagnifyCounter].push(item);
            }

            // creates conditional statement to set the length of a compressed row
            if (cropCheck == false) {
                cropCheck = true;
                rawCropLength = rawDataStore.length;
            }
        }

        localRawArray = data;

    });

    d3.json(reducedGraphArray, function(data) {

        for (var x = 0; x < data.length; x++) {
            data[x] = data[x].splice(0, data[x].length - 1)
        }

        data.reverse();

        localReducedArray = data;

    });

    // grabs angstrom conversion txt file and parses it into angstromStore array
    d3.json(angstromArray, function(data) {

        // loops through the array of arrays
        for (var x = 0; x < data.length; x++) {

            // loops through each value within each array
            for (var y = 0; y < data[x].length; y++) {

                // grabs each value iterated through and pushes it to angstromStore array
                var item = data[x][y];
                angstromStore.push(item);
            }
        }
    });

};

// creates the line generation function
var lineFunction = d3.svg.line()
    .x(function(d) {
        return d.x;
    })
    .y(function(d) {
        return d.y;
    })
    .interpolate("linear");

// normalizes a data set
var normalize_value = function(oldvalue, oldmin, oldmax, newmin, newmax) {
    return (newmax - newmin) / (oldmax - oldmin) * (oldvalue - oldmax) + newmax;
};

// grabs median value of data set
var median = function(values) {
    var temp = values.slice();
    temp.sort(function(a, b) {
        return a - b;
    });

    var half = Math.floor(temp.length / 2);

    if (temp.length % 2) {
        return temp[half];
    } else {
        return (temp[half - 1] + temp[half]) / 2.0;
    }
};

// creates the container which holds the reduced and raw data
var svgContainer = d3.select("body").append("svg")
    .attr("Call", "svgContainer")
    .attr("height", max_y)
    .attr("width", max_x)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

// creates text displayed when starting code
var mainText = svgContainer.append("text")
    .text("Choose your data.")
    .attr("class", "bigtext unselectable")
    .style("opacity", 0)
    .attr("font-size", function() {
        if (width > 1600) {
            return "100px";
        } else if (width > 1000) {
            return "72px";
        } else {
            return "50px";
        }
    })
    .attr("transform", function() {
        var textSize = this.getComputedTextLength();

        return "translate(" + ((width / 2) - (textSize / 2)) + "," + (height / 4) + ")";
    });

var nameText = svgContainer.append("text")
    .text("Nathaniel Adams")
    .attr("class", "name")
    .style("opacity", 0)
    .attr("font-size", function() {
        if (width > 1600) {
            return "30px";
        } else if (width > 1000) {
            return "18px";
        } else {
            return "12px";
        }
    })
    .attr("transform", function() {
        var textSize = this.getComputedTextLength();
    })
    .attr("transform", function() {
        var textSize = this.getComputedTextLength();

        if (width > 1600) {
            return "translate(" + ((width / 2) - (textSize / 2)) + "," + ((height / 4) + 60) + ")";
        }
        else if (width > 1000) {
            return "translate(" + ((width / 2) - (textSize / 2)) + "," + ((height / 4) + 40) + ")";
        }
        else {
            return "translate(" + ((width / 2) - (textSize / 2)) + "," + ((height / 4) + 25) + ")";
        }
    });

var clickedButton = 0;
var introClicked = false;

// var redToggle = false;
// var rawToggle = false;
// var redFirst = true;
// var rawFirst = true;

var redVizValues;
var rawVizValues;

// creates function to transition button elements from center to upper left corner
var introTransition = function() {
    if (starSelected == true) {
        introClicked = true;
        mainText.transition()
            .duration(700)
            .style("opacity", 0);

        nameText.transition()
            .duration(700)
            .style("opacity", 0);

        redButton.transition()
            .duration(700)
            .attr("x", 70)
            .attr("y", -50);

        redText.transition()
            .duration(700)
            .attr("x", 80)
            .attr("y", -31);

        rawButton.transition()
            .duration(700)
            .attr("x", -40)
            .attr("y", -50);

        rawText.transition()
            .each("end", function() {
                if (clickedButton == 1) {
                    generateRed();
                } else {
                    generateRaw();
                }
            })
            .duration(700)
            .attr("x", -17)
            .attr("y", -31);
    }
};

// creates button to generate raw data
var redButton = svgContainer.append("rect")
    .attr("class", "graphbutton")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", ((width / 2) + 20))
    .attr("y", (height / 3))
    .style("opacity", 0)
    .style("fill", "rgb(220, 220, 220)")
    .on("click", function() {
        clickedButton = 1;
        if (introClicked == false) {
            introTransition();

        } else {
            generateRed();
        }
    })
    .on("mouseover", function() {
        redButton.style("fill", "rgb(240, 240, 240)")
    })
    .on("mouseout", function() {
        redButton.style("fill", "rgb(220, 220, 220)")
    });

// creates text for redButton
var redText = svgContainer.append("text")
    .text("Reduced Data")
    .attr("class", "graphbutton")
    .attr("font-size", "12px")
    .attr("x", ((width / 2) + 30))
    .attr("y", (height / 3) + 19)
    .style("opacity", 0)
    .style("fill", "rgb(0,0,0)")
    .on("click", function() {
        clickedButton = 1;
        if (introClicked == false) {
            introTransition();
        } else {
            generateRed();
        }
    })
    .on("mouseover", function() {
        redButton.style("fill", "rgb(240, 240, 240)")
    })
    .on("mouseout", function() {
        redButton.style("fill", "rgb(220, 220, 220)")
    });

// creates button to generate raw data
var rawButton = svgContainer.append("rect")
    .attr("class", "graphbutton")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", ((width / 2) - 120))
    .attr("y", (height / 3))
    .style("opacity", 0)
    .style("fill", "rgb(220, 220, 220)")
    .on("click", function() {
        clickedButton = 2;
        if (introClicked == false) {
            introTransition();
        } else {
            generateRaw();
        }
    })
    .on("mouseover", function() {
        rawButton.style("fill", "rgb(240, 240, 240)")
    })
    .on("mouseout", function() {
        rawButton.style("fill", "rgb(220, 220, 220)")
    });

// creates text for rawButton
var rawText = svgContainer.append("text")
    .text("Raw Data")
    .attr("class", "graphbutton")
    .attr("font-size", "12px")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", ((width / 2) - 97))
    .attr("y", (height / 3) + 19)
    .style("opacity", 0)
    .style("fill", "rgb(0,0,0)")
    .on("click", function() {
        clickedButton = 2;
        if (introClicked == false) {
            introTransition();
        } else {
            generateRaw();
        }
    })
    .on("mouseover", function() {
        rawButton.style("fill", "rgb(240, 240, 240)")
    })
    .on("mouseout", function() {
        rawButton.style("fill", "rgb(220, 220, 220)")
    });

// creates graphs 1 and 2 of the raw apf data
var generateRaw = function() {
    // console.log("-----------");
    // if (redToggle == true) {
    //     console.log("remove reduced");
    //     redToggle = false;
    //     redVizValues.attr("transform", "translate(" + max_x + ", 0)");
    // }
    //
    // if (rawFirst == false) {
    //     if (rawToggle == false) {
    //         console.log("add raw");
    //         rawToggle = true;
    //         rawVizValues.attr("transform", "translate(0, 0)");
    //     }
    // }
    // else {
    //     rawFirst = false;
    //     rawToggle = true;

    if (d3.selectAll(".redviz") != undefined) {
        d3.selectAll(".redviz").remove();
    }

    var data = localRawArray;

    // creates dimension and position of bottom right raw graph 1 rectangle
    var rectX;
    var rectY;
    var rectSize;

    // defines variable to adjust size of space between each pixel
    var gapSize;

    // creates conditional statement to adjust gapSize based on screen width
    if (max_x > 1000) {
        gapSize = 2;
    } else {
        gapSize = 1;
    }

    // defines counters to be used to position each svg element
    var xCounter = -1;
    var yCounter = 0;
    var yCounterB = 0;

    var colorStore;
    var sqr;

    var containerViewer = [];

    var frameSize = 3;
    var magFrameHeight = ((max_x / 3.5) / 1.7) + (frameSize * 2);
    var magFrameWidth = (max_x / 3.5) + (frameSize * 2);

    var firstClick = true;

    // sets amount of array rows to be inspected (25 above, 25 below)
    var arrayMagnified = yCompress * 2;

    var magBox;

    var magFrame = svgContainer.append("rect")
        .attr("class", "viz")
        .style("opacity", 0.5);

    var magLine = svgContainer.append("rect")
        .attr("class", "viz magContainer")
        .attr("x", -1000)
        .attr("fill", "white");

    var magLineHori = svgContainer.append("rect")
        .attr("class", "viz magContainer")
        .attr("y", -1000)
        .attr("fill", "white");


    var magOverlay = svgContainer.append("rect")
        .attr("class", "viz magContainer")
        .attr("width", (max_x / 3.5))
        .attr("height", ((max_x / 3.5) / 1.7))
        .style("opacity", 0.0001)
        .style("fill", "green");

    var currArray;
    var currPos;

    // creates the rectangle svg elements based on magnified dataStore data
    var rectangles = svgContainer.selectAll("svg")
        .data(rawDataStore)
        .enter()
        .append("rect")
        .attr("class", "viz")

        // modifies x for each square
        .attr("x", function () {
            xCounter = xCounter + 1;
            if (xCounter == rawCropLength) {
                xCounter = 0;
            }
            return xCounter * ((width / rawCropLength) - ((10 + gapSize) / rawCropLength));
        })

        //modifies y for each square
        .attr("y", function () {
            if (yCounterB % (rawCropLength) == 0 && yCounterB != 0) {
                yCounter = yCounter + 1;
            }
            yCounterB = yCounterB + 1;
            return yCounter * ((width / rawCropLength) - ((10 + gapSize) / rawCropLength));
        })

        //modifies height of square based on (screen width / length of row) - spacing between gaps
        .attr("height", function () {
            return (width / rawCropLength) - gapSize;
        })

        //modifies width of square
        .attr("width", function () {
            return (width / rawCropLength) - gapSize;
        })

        //manipulates the color of the square based on data value
        .style("fill", function (d) {
            var negativeColors = -1 * d;
            var invertedColors = normalize_value(negativeColors, -(rmax), -(rmin), 0, 220);
            return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
        })

        // creates interaction upon clicking the square
        .on("click", function (d, i) {

            var selArray = currArray;
            var selPos = currPos;

            // separates "this clicked" index into separate variable
            var selected = i;

            // creates container to display on magnified display
            var selectedContainer = [];

            // establishes "this clicked" location in total data for selecting magnified data
            var currentLocation = dataStoreLocation[selected];

            // creates variables to represent "this" in main data: position and array
            var locArray = currentLocation["array"];
            var locPosition = currentLocation["position"];

            magViewStore = [];

            if (sqr != undefined) {
                sqr.style("fill", colorStore);
            }

            // defines the square that's clicked as a d3 selection
            sqr = d3.select(this);
            colorStore = sqr[0][0]["style"]["fill"];
            sqr.style("fill", "rgb(255,255,255)");

            // verifies each column to exist then pushes them to array
            var dataChecker = function (index, array, position, arraypush) {

                // creates 3 conditionals to push left data points into tempArray
                var tempArray = [];

                if (data[array][position - 75] != undefined) {
                    for (var z = 75; z >= 0; z--) {
                        tempArray.push(data[array + index][position - z]);
                    }
                } else {
                    for (var z = 25; z >= 0; z--) {
                        tempArray.push(data[array + index][position - z]);
                    }
                }

                // creates 3 conditionals to push right data points into tempArray
                if (data[array][position + 75] != undefined) {
                    for (var z = 0; z <= 75; z++) {
                        tempArray.push(data[array + index][position + z]);
                    }
                } else {
                    for (var z = 0; z <= 25; z++) {
                        tempArray.push(data[array + index][position + z]);
                    }
                }

                arraypush.push(tempArray);
            };

            // checks if array exists, and if so runs dataChecker to create data points
            var arrayChecker = function (array) {
                for (var a = 0; a < arrayMagnified; a++) {
                    var arrayValidated = a - (arrayMagnified / 2);
                    if (locArray - arrayValidated >= 0) {
                        dataChecker(arrayValidated, locArray, locPosition, array)
                    }
                }
            };

            arrayChecker(selectedContainer);

            containerViewer = [];

            // concatenates all container arrays into one array
            for (var b = 0; b <= selectedContainer.length; b++) {
                containerViewer = containerViewer.concat(selectedContainer[b]);
            }

            // creates counter for magBox x attr
            var lencount = 0;

            if (firstClick == true) {
                firstClick = false;

                magFrame.moveToFront();

                magBox = svgContainer.selectAll("svg")
                    .data(containerViewer)
                    .enter()
                    .append("rect");

                var sel = d3.selectAll(".magContainer");
                sel.moveToFront();

            }

            magBox.attr("width", ((max_x / 3.5) / selectedContainer[1].length))
            // sets height of magBox to a percentage of the total waterfall height
                .attr("height", ((max_x / 3.5) / 1.7) / arrayMagnified)
                .attr("x", function () {
                    lencount++;

                    if (lencount == parseInt(containerViewer.length / arrayMagnified)) {
                        lencount = 0;
                    }

                    if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                        return -(rectSize * 2) + (lencount * ((max_x / 3.5) / selectedContainer[1].length));

                    } else {
                        return (rectX - (magFrameWidth * 0.9)) + (lencount * ((max_x / 3.5) / selectedContainer[1].length));
                    }
                })
                .attr("y", function (d, i) {

                    // height of each magBox pixel
                    var pixelHeight = ((max_x / 3.5) / 1.7) / arrayMagnified;

                    // uses i to iterate in relation to array length
                    var iterator = parseInt(i / selectedContainer[1].length);

                    if (selected > (rawDataStore.length) / 2) {
                        return (-(rectSize * 2) + pixelHeight * iterator);
                    } else {
                        return ((rectY - magFrameHeight * 0.8) + pixelHeight * iterator);
                    }
                })
                .style("fill", function (d, i) {
                    var negativeColors = -1 * containerViewer[i];
                    var invertedColors = normalize_value(negativeColors, -(rmax), -(rmin), 0, 220);
                    return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
                })
                .attr("class", "viz");

            magFrame.attr("x", function (d, i) {
                if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                    return -(rectSize * 2) + (i * ((max_x / 3.5))) - frameSize;
                } else {
                    return (rectX - (magFrameWidth * 0.9)) + (i * ((max_x / 3.5))) - frameSize;
                }
            })
                .attr("y", function () {
                    if (i > (rawDataStore.length) / 2) {
                        return (-(rectSize * 2) - frameSize);
                    } else {
                        return ((rectY - magFrameHeight * 0.8) - frameSize);
                    }
                })
                .attr("width", (max_x / 3.5) + (frameSize * 2))
                .attr("height", ((max_x / 3.5) / 1.7) + (frameSize * 2))
                .style("fill", "black");

            magOverlay.attr("x", function (d, i) {
                if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                    return -(rectSize * 2);
                } else {
                    return (rectX - (magFrameWidth * 0.9));
                }
            })
                .attr("y", function () {
                    if (i > (rawDataStore.length) / 2) {
                        return -(rectSize * 2);
                    } else {
                        return (rectY - magFrameHeight * 0.8);
                    }
                })
                .on("mousemove", function () {

                    var xCoord = parseInt(selPos * xCompress);
                    var yCoord = parseInt(selArray * yCompress);
                    var xPixelAdd = magLine.attr("x") - magFrame.attr("x") - frameSize;

                    var xDivider = (magFrame.attr("width") - (frameSize * 2)) / (xCompress * 5);

                    var yPixelAdd = magLineHori.attr("y") - magFrame.attr("y") - frameSize;
                    var yDivider = (magFrame.attr("height") - (frameSize * 2)) / (yCompress * 5);

                    var dataLocation = "(" + (parseInt(xCoord + parseInt(xPixelAdd / xDivider)) - (xCompress * 2)) + ", " + (yCoord + parseInt(yPixelAdd / yDivider) - (yCompress * 2)) + ")";

                    coordinateText.text(dataLocation)
                        .attr("fill-opacity", 1);

                    magLine.attr("height", ((max_x / 3.5) / 1.7) + (frameSize * 2) - (frameSize * 2))
                        .attr("width", 2)
                        .attr("x", function () {
                            return d3.event.pageX - margin.left - 8;
                        })
                        .attr("y", function () {
                            if (selected > (rawDataStore.length) / 2) {
                                return -(rectSize * 2);
                            } else {
                                return (rectY - magFrameHeight * 0.8);
                            }
                        });

                    magLineHori.attr("height", 2)
                        .attr("width", (max_x / 3.5) + (frameSize * 2))
                        .attr("x", function () {
                            if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                                return (rectX - (magFrameWidth * 0.9));
                            } else {
                                return -(rectSize * 2);
                            }
                        })
                        .attr("y", function () {
                            return d3.event.pageY - (margin.top * 2) - 15;
                        });

                })
                .on("mouseout", function (d, i) {
                    magLine.attr("x", -1000);
                    magLineHori.attr("y", -1000)
                });

        })

        // code to expand or detract rectangles based on mouse events
        .on("mouseover", function (d, i) {

            var sqr = d3.select(this);
            var rectsize = (width / rawCropLength) - gapSize;

            currArray = parseInt(i / rawCropLength);
            currPos = (i - (currArray * rawCropLength));

            var dataLocation = ("(" + currPos * xCompress + ", " + currArray * yCompress + ")");

            coordinateText.text(dataLocation)
                .attr("class", "viz")
                .attr("fill-opacity", 1);

            var growRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {
                        return rectsize * 0.5;
                    })
                    .attr("height", function () {
                        return rectsize * 0.5;
                    });
            };

            //defines adjacent rectangles to current rectangle
            var top;
            var bottom;
            var left;
            var right;

            // applies top rectangle attributes
            if (rawDataStore.length > rawCropLength) {
                top = d3.select(rectangles[0][i - rawCropLength]);
                top.attr("transform", function () {
                    return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.075) + ")"
                });
                growRect(top);
            }

            // applies bottom rectangle attributes
            if (rawDataStore.length - i > rawCropLength) {
                bottom = d3.select(rectangles[0][i + rawCropLength]);
                bottom.attr("transform", function () {
                    return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.425) + ")"
                });
                growRect(bottom);
            }

            // applies left rectangle attributes
            if (i % rawCropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                left.attr("transform", function () {
                    return "translate(" + (rectsize * 0.075) + "," + (rectsize * 0.25) + ")"
                });
                growRect(left);
            }

            // applies right rectangle attributes
            if (i % rawCropLength < (rawCropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                right.attr("transform", function () {
                    return "translate(" + (rectsize * 0.425) + "," + (rectsize * 0.25) + ")";
                });
                growRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("transform", function () {
                    return "translate(" + (-1 * (rectsize / 2)) + "," + (-1 * (rectsize / 2)) + ")"
                })
                .attr("width", function () {
                    return rectsize * 2;
                })
                .attr("height", function () {
                    return rectsize * 2;
                });
        })

        // restores square size and positions upon the mouse leaving the element
        .on("mouseout", function (d, i) {
            var sqr = d3.select(this);
            var rectsize = (width / rawCropLength) - gapSize;

            // function that shrinks the rectangle
            var shrinkRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {
                        return rectsize;
                    })
                    .attr("height", function () {
                        return rectsize;
                    })
                    .attr("transform", function () {
                        return "translate(" + 0 + "," + 0 + ")"
                    });
            };

            var top;
            var bottom;
            var left;
            var right;

            if (rawDataStore.length > rawCropLength) {
                top = d3.select(rectangles[0][i - rawCropLength]);
                shrinkRect(top);
            }
            if (rawDataStore.length - i > rawCropLength) {
                bottom = d3.select(rectangles[0][i + rawCropLength]);
                shrinkRect(bottom);
            }
            if (i % rawCropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                shrinkRect(left);
            }
            if (i % rawCropLength < (rawCropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                shrinkRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("width", function () {
                    return rectsize;
                })
                .attr("height", function () {
                    return rectsize;
                })
                .attr("transform", function () {
                    return "translate(" + 0 + "," + 0 + ")"
                });
        });

    var tempContainer = rectangles[0].slice(-1)[0];

    rectX = tempContainer["x"]["baseVal"]["value"];
    rectY = tempContainer["y"]["baseVal"]["value"];
    rectSize = (width / rawCropLength) - gapSize;

    var coordinateText = svgContainer.append("text")
        .text(" ")
        .attr("font-size", function () {
            if (max_x > 1600) {
                return "18px";
            } else if (max_x > 1200) {
                return "15px";
            } else {
                return "10px";
            }
        })
        .attr("transform", "translate( " + (max_x / 3) + ", " + (rectY + (rectSize * 3)) + ")")
        .attr("class", "unselectable viz")
        .style("fill", "rgb(0, 0, 0)");

    // rawVizValues = d3.selectAll(".viz");
};

// creates graphs 1, 2, and 3 of the raw apf data
var generateRed = function() {
    // console.log("-----------");
    // if (rawToggle == true) {
    //     console.log("remove raw");
    //     rawToggle = false;
    //     rawVizValues.attr("transform", "translate(" + max_x + ", 0)");
    // }
    //
    // if (redFirst == false) {
    //     if (redToggle == false) {
    //         console.log("add reduced");
    //         redToggle = true;
    //         redVizValues.attr("transform", "translate(0, 0)");
    //         redVizValues.attr("stroke-opacity", 0);
    //     }
    // }
    // else {
    //     redToggle = true;
    //     redFirst = false;

    if (d3.selectAll(".viz") != undefined) {
        d3.selectAll(".viz").remove();
    }

    // creates conditional for graph 3 axes of the reduced graph
    var axisGenerated = false;

    // creates x axis of graph 3
    var xAxisCreator;
    var xAxisRed;

    // creates y axis of graph 3
    var yAxisCreator;
    var yAxisRed;

    var data = localReducedArray;

    // compresses reduced data by a factor of the value
    var xRedCompress = 1;
    var yRedCompress = 30;

    // creates array for storing line data for graph 3 of reduced data
    var lineData = [];


    redFirst = false;

    // gets dimensions of last rectangle in graph 1 array
    var rectX;
    var rectY;
    var rectSize;

    // sets the spacing between each data point in graph 1
    var gapSize = 1;

    // sets variables to be defined as the minimum and maximum values of the compressed (and reduced) data set
    var cmax = 0;
    var cmin = 100000;

    // creates variable for the entire data set to be stored in as individual data points rather than an array of arrays
    var totalData = [];

    // creates array where the graph 1 compressed data points will be stored
    var dataStore = [];

    // creates dictionary where each set of magnified points associated with an index of the graph 1 compressed data points will be stored
    var dataMagnified = {};

    // creates a counter to iterate through for the dataMagnified dictionary to use later
    var magnifyCounter = -1;

    // creates a loop to compress data based on xRedCompress and yRedCompress
    var cropCheck = false;

    // loops through the array of arrays in the r_pyfits data
    for (var x = 0; x < data.length; x++) {

        // loops through the selected array for each data point
        for (var y = 0; y < data[x].length; y++) {

            // defines each data point
            var item = data[x][y];

            // pushes each data point to the totalData array
            totalData.push(item);

            // creates a conditional statement to check if the data point index is divisible by the yRedCompress and xRedCompress variables
            if (y % yRedCompress == 0 && x % xRedCompress == 0) {

                // creates conditionals to set the max and min values of the compressed data
                if (dataStore[item] > cmax) {
                    cmax = dataStore[item];
                }
                if (dataStore[item] < cmin) {
                    cmin = dataStore[item];
                }

                // pushes compressed data points into dataStore array
                dataStore.push(item);

                // iterates through magnifyCounter, done within conditional to associate magnified data with a compressed data point
                magnifyCounter++;

                //creates array within each magnifyCounter index
                dataMagnified[magnifyCounter] = [];
            }

            // stores all magnified data points in far right nodes
            dataMagnified[magnifyCounter].push(item);
        }

        // defines the length of a single array in the r_pyfits data
        if (cropCheck == false) {
            cropCheck = true;
            cropLength = dataStore.length;
        }
    }

    // defines minimum and maximum value
    var oldmin = 1000000;
    var oldmax = 0;

    // defines counters to be used to position each svg element
    var xCounter = -1;
    var yCounter = 0;
    var yCounterB = 0;

    var colorStore;
    var sqr;
    var magFrame;
    var dataMedian = median(dataStore);

    var reducedStore = [];

    for (var y = 0; y < dataStore.length; y += 1) {
        if (dataStore[y] > (dataMedian * 2)) {
            reducedStore.push(dataMedian * 2);
        } else {
            reducedStore.push(dataStore[y]);
        }

        if (reducedStore[y] > oldmax) {
            oldmax = reducedStore[y];
        }
        if (reducedStore[y] < oldmin) {
            oldmin = reducedStore[y];
        }
    }

    var pixelSize = (width / cropLength);

    var firstClick = true;

    //creates original magnified box with filler data
    var magBox;
    var magBoxData;

    var magFrame = svgContainer.append("rect")
        .attr("class", "redviz")
        .attr("width", 10)
        .attr("height", 10)
        .attr("y", -1000)
        .style("fill", "rgb(255,255,255)");

    var lineGraph;

    // creates the rectangle svg elements based on magnified dataStore data
    var rectangles = svgContainer.selectAll("svg")
        .data(reducedStore)
        .enter()
        .append("rect")
        .attr("class", "redviz")
        .attr("preserveAspectRatio", "none")

        // modifies x for each square
        .attr("x", function () {
            xCounter = xCounter + 1;

            if (xCounter == cropLength) {
                xCounter = 0;
            }
            return xCounter * pixelSize;
        })

        //modifies y for each square
        .attr("y", function () {
            if (yCounterB % (cropLength) == 0 && yCounterB != 0) {
                yCounter = yCounter + 1;
            }
            yCounterB = yCounterB + 1;
            return yCounter * ((width / cropLength) - ((10 + gapSize) / cropLength));
        })

        //modifies height of square based on (screen width / length of row) - spacing between gaps
        .attr("height", function () {
            return pixelSize - gapSize;
        })

        //modifies width of square
        .attr("width", function () {
            return pixelSize - gapSize;
        })

        //manipulates the color of the square based on data value
        .style("fill", function (d) {
            var negativeColors = -1 * d;
            var invertedColors = normalize_value(negativeColors, -(oldmax), -(oldmin), 0, 220);
            return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
        })

        .on("click", function (d, i) {
            magMainStore = [];
            lineData = [];

            if (sqr != undefined) {
                sqr.style("fill", colorStore);
            }

            if (lineGraph != undefined) {
                lineGraph.remove();
            }

            // defines the square that's clicked as a d3 selection
            sqr = d3.select(this);
            colorStore = sqr[0][0]["style"]["fill"];
            sqr.style("fill", "rgb(255,255,255)");

            var magBoxSelect;

            var frameSize = 3;

            // pushes all dataMagnified arrays left and right of i to magMainStore
            var dataGrabber = function (indexGrabbed, arrayPushed) {

                var magnifyCondition = function (start, end) {
                    for (var b = start; b <= end; b++) {
                        if (dataMagnified[indexGrabbed + b] != undefined) {
                            dataMagnified[indexGrabbed + b].forEach(function (z) {
                                arrayPushed.push(z);
                            })
                        }
                    }
                };

                if (((indexGrabbed - 1) / cropLength).toString().indexOf(".") == -1) {
                    magnifyCondition(-1, 2);
                } else if ((indexGrabbed / cropLength).toString().indexOf(".") == -1) {
                    magnifyCondition(0, 2);
                } else if (((indexGrabbed + 1) / cropLength).toString().indexOf(".") == -1) {
                    magnifyCondition(-2, 0);
                } else if (((indexGrabbed + 2) / cropLength).toString().indexOf(".") == -1) {
                    magnifyCondition(-2, 1);
                } else {
                    magnifyCondition(-2, 2);
                }
            };

            dataGrabber(i, magMainStore);

            if (firstClick == true) {
                firstClick = false;

                magFrame.moveToFront();

                var storageLength = dataMagnified[0].length * 5;
                var emptyArray = new Array(storageLength);

                magBoxData = svgContainer.selectAll("svg")
                    .data(emptyArray);

                magBox = magBoxData.enter()
                    .append("rect");

            }

            var magHeight = (max_x / 3.5) / 1.7;
            var magWidth = (max_x / 3.5);

            // creates the magBox container with the data; positions and scales every data point as currently selected square
            magBox.attr("class", "redviz")
                .attr("width", ((max_x / 3.5) / magMainStore.length))
                .attr("height", magHeight)
                .attr("x", function (d, i) {
                    if (i >= magMainStore.length) {
                        return -100000;
                    } else {
                        if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                            return -(magWidth * 0.1) + (i * ((max_x / 3.5) / magMainStore.length));
                        } else {
                            return (rectX - (magWidth / 1.1)) + (i * ((max_x / 3.5) / magMainStore.length));
                        }
                    }
                })
                .attr("y", function () {
                    if (i > (reducedStore.length) / 2) {
                        return -(magHeight / 13);
                    } else {
                        return (rectY - (magHeight / 1.1));
                    }
                })
                .style("fill", function (d, i) {
                    var negativeColors = -1 * magMainStore[i];
                    var invertedColors = normalize_value(negativeColors, -(oldmax), -(oldmin), 0, 220);
                    return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
                })
                .on("mouseover", function () {
                    var currBar = d3.select(this);
                    currBar.style("fill", "rgb(255,255,255)");
                    magBoxSelect = true;

                })
                .on("mouseout", function () {
                    magBox.style("fill", function (d, i) {
                        var negativeColors = -1 * magMainStore[i];
                        var invertedColors = normalize_value(negativeColors, -(oldmax), -(oldmin), 0, 220);
                        return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
                    });

                    selectorDot.transition()
                        .duration(50)
                        .attr("cx", -10000);

                    selectorLine.transition()
                        .duration(50)
                        .attr("x", -10000);

                    magBoxSelect = false;
                })
                .on("mousemove", function (d, i) {
                    var currBar = d3.select(this);
                    selectorDot.transition()
                        .duration(25)
                        .attr("cx", function (d, i) {
                            return (((right_rect + rect_width) / magMainStore.length) * magBox[0].indexOf(currBar[0][0]));
                        })
                        .attr("cy", findYatXbyBisection(((right_rect + rect_width) / magMainStore.length) * magBox[0].indexOf(currBar[0][0]), lineGraph[0][0]));
                    selectorLine.transition()
                        .duration(25)
                        .attr("x", function (d, i) {
                            return (((right_rect + rect_width) / magMainStore.length) * magBox[0].indexOf(currBar[0][0]));
                        });
                });

            magBoxData.exit().remove();

            magFrame.attr("class", "redviz")
                .style("opacity", 0.5)
                .attr("x", function (d, i) {
                    if (d3.event.pageX / max_x - 0.01 >= 0.5) {
                        return -(magWidth * 0.1) + (i * ((max_x / 3.5))) - frameSize;
                    } else {
                        return (rectX - (magWidth / 1.1)) + (i * ((max_x / 3.5))) - frameSize;
                    }
                })
                .attr("y", function () {
                    if (i > (reducedStore.length) / 2) {
                        return -(magHeight / 13) - frameSize;
                    } else {
                        return (rectY - (magHeight / 1.1)) - frameSize;
                    }
                })
                .attr("width", (max_x / 3.5) + (frameSize * 2))
                .attr("height", magHeight + (frameSize * 2))
                .style("fill", "rgb(0, 0, 0)");

            var tempStore = [];
            for (var c = 0; c < magMainStore.length; c++) {

                // sets minimum and maximum values
                var mMax = Math.max.apply(null, magMainStore);
                var mMin = Math.min.apply(null, magMainStore);

                // generates lineData array to create lineGraph
                lineData.push({
                    "x": (c * (right_rect + (rect_width)) / magMainStore.length),
                    "y": normalize_value(magMainStore[c], mMin, mMax, topPos + height - 5, topPos + 5),
                    "index": totalData.indexOf(magMainStore[c]),
                    "angstrom": angstromStore[totalData.indexOf(magMainStore[c])]
                });

                tempStore.push(angstromStore[totalData.indexOf(magMainStore[c])]);
            }

            var lineDataMin = lineData[0].angstrom;
            var lineDataMax = lineData[lineData.length - 1].angstrom;

            //deletes prior generated line this resets path every time i'm in starbucks no :(
            d3.select("path").remove();

            // generates a path based on line data as an argument of the line function
            lineGraph = svgContainer.append("path")
                .attr("class", "redviz")
                .attr("d", lineFunction(lineData))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            d3.selectAll(".lineContainer").moveToFront();

            var xScale = d3.scale.linear()
                .domain([lineDataMin, lineDataMax])
                .range([0, rectX + rectSize]);

            var yScale = d3.scale.linear()
                .domain([0, d3.max(lineData, function (d) {
                    return d.y;
                })])
                .range([height, 0]);

            xAxisRed = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .outerTickSize(0)
                .tickPadding(10);

            yAxisRed = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(3)
                .outerTickSize(0)
                .tickPadding(4);

            if (axisGenerated == false) {
                axisGenerated = true;

                xAxisCreator = svgContainer.append("g")
                    .attr("class", "xaxis redviz")
                    .attr("transform", "translate(" + 0 + "," + (topPos + height) + ")");

                yAxisCreator = svgContainer.append("g")
                    .attr("class", "yaxis redviz")
                    .attr("transform", "translate(" + 0 + "," + ((topPos)) + ")");

            }

            xAxisCreator.call(xAxisRed);
            yAxisCreator.call(yAxisRed);

            var xAxisTitle = svgContainer.append("text")
                .attr("class", "redviz")
                .text("Angstroms")
                .attr("y", function () {
                    return height + topPos + 50;
                })
                .attr("x", function () {
                    return ((right_rect + rect_width) / 2) - 50;
                });

            var yAxisTitle = svgContainer.append("text")
                .attr("class", "redviz")
                .text("Flux")
                .attr("y", function () {
                    return -40;
                })
                .attr("x", function () {
                    return -((height / 2) + topPos + 20);
                })
                .attr("transform", function() {
                    return "rotate(-90)";
                });



            var rectBackground = svgContainer.append("rect")
                .attr("class", "redviz")
                .attr("width", right_rect + rect_width)
                .attr("height", (rectX + rectSize) / 7)
                .attr("y", bottom_rect + rect_width + 25)
                .style("fill", "rgb(200, 200, 200)")
                .style("opacity", 0.001)
                .on("mouseover", function (d) {
                    active = true;
                })
                .on("mouseout", function (d) {
                    active = false;

                    selectorDot.attr("cx", -2000);

                    selectorLine.attr("x", -2000);

                    magBox.style("fill", function (d, i) {
                        var negativeColors = -1 * magMainStore[i];
                        var invertedColors = normalize_value(negativeColors, -(oldmax), -(oldmin), 0, 220);
                        return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
                    });

                    angstromRect.transition()
                        .delay(50)
                        .style("opacity", 0);

                    angstromText.transition()
                        .delay(50)
                        .style("opacity", 0);

                })
                .on("mousemove", function (d) {

                    if (active == true) {
                        var mousePos = d3.event.pageX - margin.left - 8;
                        var chunk_width = (right_rect + rect_width) / magMainStore.length;
                        var curr_chunk = parseInt(mousePos / chunk_width);

                        magBox.style("fill", function (d, i) {
                            var negativeColors = -1 * magMainStore[i];
                            var invertedColors = normalize_value(negativeColors, -(oldmax), -(oldmin), 0, 220);
                            return "rgb(" + 255 + "," + (parseInt(invertedColors)) + "," + 30 + ")";
                        })
                            .filter(function (d, i) {
                                return i === (curr_chunk - 1);
                            })
                            .style("fill", "rgb(255,255,255)")
                            .filter(function (d, i) {
                                return i === (curr_chunk);
                            })
                            .style("fill", "rgb(255,255,255)")
                            .filter(function (d, i) {
                                return i === curr_chunk;
                            })
                            .style("fill", "rgb(255,255,255)");

                        selectorDot.attr("cx", mousePos);
                        selectorDot.attr("cy", findYatXbyBisection(mousePos, lineGraph[0][0]));
                        selectorLine.attr("x", mousePos);

                        var angstromAtMouse = parseFloat(((mousePos / rectBackground.attr("width")) * (lineDataMax - lineDataMin)) + lineDataMin).toFixed(2);

                        angstromText.transition()
                            .delay(50)
                            .style("opacity", 1);

                        angstromText.text("Wavelength of " + angstromAtMouse + "Å")
                            .attr("x", mousePos + 10 - 180);

                        angstromRect.transition()
                            .delay(50)
                            .style("opacity", 1);

                        angstromRect.attr("x", mousePos - 180)
                    }
                });

        })

        // code to expand or detract rectangles based on mouse events
        .on("mouseover", function (d, i) {
            var sqr = d3.select(this);
            var rectsize = (width / cropLength) - gapSize;

            var growRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {
                        return rectsize * 0.5;
                    })
                    .attr("height", function () {
                        return rectsize * 0.5;
                    });
            };

            //defines adjacent rectangles to current rectangle
            var top;
            var bottom;
            var left;
            var right;

            // applies top rectangle attributes
            if (reducedStore.length > cropLength) {
                top = d3.select(rectangles[0][i - cropLength]);
                top.attr("transform", function () {
                    return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.075) + ")"
                });
                growRect(top);
            }

            // applies bottom rectangle attributes
            if (reducedStore.length - i > cropLength) {
                bottom = d3.select(rectangles[0][i + cropLength]);
                bottom.attr("transform", function () {
                    return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.425) + ")"
                });
                growRect(bottom);
            }

            // applies left rectangle attributes
            if (i % cropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                left.attr("transform", function () {
                    return "translate(" + (rectsize * 0.075) + "," + (rectsize * 0.25) + ")"
                });
                growRect(left);
            }

            // applies right rectangle attributes
            if (i % cropLength < (cropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                right.attr("transform", function () {
                    return "translate(" + (rectsize * 0.425) + "," + (rectsize * 0.25) + ")";
                });
                growRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("transform", function () {
                    return "translate(" + (-1 * (rectsize / 2)) + "," + (-1 * (rectsize / 2)) + ")"
                })
                .attr("width", function () {
                    return rectsize * 2;
                })
                .attr("height", function () {
                    return rectsize * 2;
                });
        })

        // restores square size and positions upon the mouse leaving the element
        .on("mouseout", function (d, i) {
            var sqr = d3.select(this);
            var rectsize = (width / cropLength) - gapSize;

            // function that shrinks the rectangle
            var shrinkRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {

                        return rectsize;
                    })
                    .attr("height", function () {
                        return rectsize;
                    })
                    .attr("transform", function () {
                        return "translate(" + 0 + "," + 0 + ")"
                    });
            };

            var top;
            var bottom;
            var left;
            var right;

            if (reducedStore.length > cropLength) {
                top = d3.select(rectangles[0][i - cropLength]);
                shrinkRect(top);
            }
            if (reducedStore.length - i > cropLength) {
                bottom = d3.select(rectangles[0][i + cropLength]);
                shrinkRect(bottom);
            }
            if (i % cropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                shrinkRect(left);
            }
            if (i % cropLength < (cropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                shrinkRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("width", function () {
                    return rectsize;
                })
                .attr("height", function () {
                    return rectsize;
                })
                .attr("transform", function () {
                    return "translate(" + 0 + "," + 0 + ")"
                });

        });

    var tempContainer = rectangles[0].slice(-1)[0];

    rectX = tempContainer["x"]["baseVal"]["value"];
    rectY = tempContainer["y"]["baseVal"]["value"];
    rectSize = (width / cropLength) - gapSize;

    var right_rect = d3.select(rectangles[0])[0][0][cropLength - 1]["x"]["animVal"]["value"];
    var rect_width = d3.select(rectangles[0])[0][0][cropLength - 1]["width"]["animVal"]["value"];
    var bottom_rect = d3.select(rectangles[0])[0][0][reducedStore.length - 1]["y"]["animVal"]["value"];

    var active;

    var findYatXbyBisection = function (x, path, error) {
        var length_end = path.getTotalLength(),
            length_start = 0,
            point = path.getPointAtLength((length_end + length_start) / 2) // get the middle point
            ,
            bisection_iterations_max = 50,
            bisection_iterations = 0;

        error = error || 0.01;

        while (x < point.x - error || x > point.x + error) {
            // get the middle point
            point = path.getPointAtLength((length_end + length_start) / 2);

            if (x < point.x) {
                length_end = (length_start + length_end) / 2
            } else {
                length_start = (length_start + length_end) / 2
            }

            // Increase iteration
            if (bisection_iterations_max < ++bisection_iterations)
                break;
        }
        return point.y;
    };

    var height = ((rectX + rectSize) / 7);
    var topPos = bottom_rect + rect_width + 25;

    var selectorLine = svgContainer.append("rect")
        .attr("class", "redviz lineContainer")
        .attr("width", 1)
        .attr("height", height)
        .attr("x", -1000)
        .attr("y", topPos)
        .style("fill", "black");

    var selectorDot = svgContainer.append("circle")
        .attr("class", "redviz lineContainer")
        .attr("cx", -1000)
        .attr("cy", topPos + height)
        .attr("r", 4)
        .style("fill", "black");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip redviz")
        .style("background-color", "rgb(250,250,250)")
        .style("padding", "10px")
        .style("height", "auto")
        .style("width", "150px")
        .style("left", -1000 + "px")
        .style("top", topPos + height + "px")
        .style("box-shadow", "3px 3px 5px rgba(255,255,255,0.5)");

    var bottomLine = svgContainer.append("rect")
        .attr("class", "redviz")
        .attr("width", rectX + rectSize)
        .attr("height", 1)
        .attr("y", topPos + height)
        .style("fill", "rgb(0, 0, 0)");

    var leftLine = svgContainer.append("rect")
        .attr("class", "redviz")
        .attr("width", 1)
        .attr("height", height)
        .attr("y", topPos)
        .style("fill", "rgb(0, 0, 0)");

    var horiLine1 = svgContainer.append("svg:line")
        .attr("class", 'd3-dp-line redviz')
        .attr("x1", 0)
        .attr("y1", topPos)
        .attr("x2", rectX + rectSize)
        .attr("y2", topPos)
        .style("stroke-dasharray", ("5, 5"))
        .style("opacity", 0.3)
        .style("stroke", "rgb(0, 0, 0)");

    var horiLine2 = svgContainer.append("svg:line")
        .attr("class", 'd3-dp-line redviz')
        .attr("x1", 0)
        .attr("y1", topPos + (height / 2))
        .attr("x2", rectX + rectSize)
        .attr("y2", topPos + (height / 2))
        .style("stroke-dasharray", ("5, 5"))
        .style("opacity", 0.3)
        .style("stroke", "rgb(0, 0, 0)");

    var angstromRect = svgContainer.append("rect")
        .attr("class", "redviz lineContainer")
        .style("height", "30px")
        .style("width", "150px")
        .attr("y", (height * 0.2) + topPos)
        .style("opacity", 0)
        .style("fill", "rgb(240, 240, 240)");

    var angstromText = svgContainer.append("text")
        .attr("class", "redviz lineContainer")
        .text("Reduced Data")
        .attr("font-size", "12px")
        .style("opacity", 0)
        .attr("y", (height * 0.2) + topPos + 20)
        .style("fill", "rgb(0,0,0)");

    // redVizValues = d3.selectAll(".redviz");
};

