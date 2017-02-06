var screenHeight = $(window).height();
var screenWidth = $(window).width();

var margin;

if (screenHeight > screenWidth) {
    margin = {top: screenHeight * 0.06, right: screenWidth * 0.08, bottom: screenHeight * 0.04, left: screenWidth * 0.09};
}
else {
    margin = {top: screenHeight * 0.06, right: screenWidth * 0.2, bottom: screenHeight * 0.04, left: screenWidth * 0.2};
}

var width = screenWidth - margin.left - margin.right,
    height = (screenHeight * 0.17) - margin.top - margin.bottom;

var graphBuilder = function(graphNumber, data, headerText, subHeaderText, lineColor) {
    var dataset = [
        {x: 0, y: 5},
        {x: 1, y: 8},
        {x: 2, y: 13},
        {x: 3, y: 12},
        {x: 4, y: 16},
        {x: 5, y: 21},
        {x: 6, y: 18},
        {x: 7, y: 23},
        {x: 8, y: 24},
        {x: 9, y: 28},
        {x: 10, y: 35},
        {x: 11, y: 30},
        {x: 12, y: 32},
        {x: 13, y: 36},
        {x: 14, y: 40},
        {x: 15, y: 38},
        {x: 16, y: 5},
        {x: 17, y: 8},
        {x: 18, y: 13},
        {x: 19, y: 12},
        {x: 20, y: 16},
        {x: 21, y: 21},
        {x: 22, y: 18},
        {x: 23, y: 23},
        {x: 24, y: 24},
        {x: 25, y: 28},
        {x: 26, y: 35},
        {x: 27, y: 30},
        {x: 28, y: 32},
        {x: 29, y: 36},
        {x: 30, y: 40},
        {x: 31, y: 12},
        {x: 32, y: 16},
        {x: 33, y: 21},
        {x: 34, y: 18},
        {x: 35, y: 23},
        {x: 36, y: 24},
        {x: 37, y: 28},
        {x: 38, y: 35},
        {x: 39, y: 30},
        {x: 40, y: 32},
        {x: 41, y: 36},
        {x: 42, y: 40},
        {x: 43, y: 28},
        {x: 44, y: 35},
        {x: 45, y: 30},
        {x: 46, y: 32},
        {x: 47, y: 36},
        {x: 48, y: 40},
        {x: 49, y: 37},
        {x: 50, y: 40}
    ];

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d){ return d.x; })])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d){ return d.y; })])
        .range([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function (d) {
            if (d == dataset.length - 1) {
                return "JUST NOW"
            }
            else {
                return ((dataset.length - 1) - d) + " HOURS AGO";

            }
        })
        .ticks(4)
        .tickSize(-height - 10);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5)
        .tickSize(-width);

    var line = d3.line()
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(d.y); });

    var svg = d3.select("#graph-" + graphNumber)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(0, 10)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("path")
        .data([dataset])
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", lineColor);

    svg.append("text")
        .attr("x", (width * 0.015))
        .attr("y", 0 - (margin.top / 1.5))
        .attr("class", "text-header")
        .text(headerText);

    var headerHeight = $(".text-header").height();

    svg.append("text")
        .attr("x", (width * 0.015))
        .attr("y", 0 - (margin.top / 1.5) + headerHeight)
        .attr("class", "text-subheader")
        .text(subHeaderText);
};

graphBuilder(1, "", "pH", "Measured in mV of pH", "#d25353");
graphBuilder(2, "", "Water Temperature", "Measured in °C", "#d8da66");
graphBuilder(3, "", "Electrical Conductivity", "Measured in S/m", "#9ce7ad");
graphBuilder(4, "", "Humidity", "Measured in %", "#66d9da");
graphBuilder(5, "", "Air Temperature", "Measured in °C", "#1b93d6");