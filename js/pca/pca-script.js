import { dataSetFactory } from "../dataset.js";

var PCAScatterPlotBuilder = (function() {

    //Global variables
    var data = dataSetFactory.getInstance().data;

    var margin = {top: 10, right: 5, bottom: 30, left: 50},
    width = 400 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;

    var padding = {top: 20, right: 20, bottom: 0, left: 20};

    var h = 100;
    var w = 100;

    //Define svg
    var svg = d3.select("#pca-container").append("svg")
        .attr("width", w + '%')
        .attr("height", h + '%');

    var svgClientSize = svg.node().getBoundingClientRect();

    var x = d3.scaleLinear().range([0, svgClientSize.width-(padding.right * 4)]),
        y = d3.scaleLinear().range([svgClientSize.height-(padding.right * 2), 0]);

    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    var dots;

    //Append clipPath to svg
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w + '%')
        .attr("height", h + '%');

    //Appen focus to svg
    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function getMinMaxAndAddConstant(nameProperties, x) {
        var minMax = d3.extent(data, function(d) { return +d[nameProperties]; });
        minMax[0] = minMax[0] - x;
        minMax[1] = minMax[1] + x;

        return minMax;
    }

    function setDomainAxis(axis, valueDomain) {
        axis.domain(valueDomain);
    }

    function buildDots() {
        //Get color scale
        var colorScale = d3.scale.category20();

        dots = focus.append("g");
    
        dots.selectAll("circle")
            .data(data)
            .enter().append('circle')
            .attr('cx',function (d) { return x(+d['X']); })
            .attr('cy',function (d) { return y(+d['Y']) })
            .attr('r',4)
            .attr('stroke','black')
            .attr('stroke-width',1)
            .attr('fill',function (d,i) { return colorScale(i) })
            .on('mouseover', function () {
                d3.select(this)
                .transition()
                .duration(250)
                .attr('r',15)
                .attr('stroke-width',3)
            })
            .on('mouseout', function () {
                d3.select(this)
                .transition()
                .duration(400)
                .attr('r',5)
                .attr('stroke-width',1)
            })
            .append('title')
            .text(function (d) { return '\id: ' + d['ID'] +
                                        '\nseverity: ' + d['Severity'] });
    }

    function buildAxes() {
        focus.append("g")
            .attr("id", "xAxis")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("id", "yAxis")
            .attr("class", "axis axis--y")
            .call(yAxis);
    }

    function appendTextOnXAxis(text) {
        svg.append("text")             
            .attr("transform","translate(" + (svgClientSize.width / 2) + " ," + 
                    (svgClientSize.height - margin.top) + ")")
            .style("text-anchor", "middle")
            .text(text);
    }

    function appendTextOnYAxis(text) {
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (svgClientSize.height / 2) + margin.bottom)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(text);  
    }
    
    function yChange() {
        d3.select('#yAxis') // redraw the yAxis
            .transition().duration(100)
            .call(yAxis)  
        }

    function xChange() {
        d3.select('#xAxis') // redraw the xAxis
            .transition().duration(100)
            .call(xAxis)
    }

    function redraw() {

        svgClientSize = svg.node().getBoundingClientRect();

        x = d3.scaleLinear().range([0, svgClientSize.width-(padding.right * 4)]),
        y = d3.scaleLinear().range([svgClientSize.height-(padding.right * 2), 0]);

        xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

        setDomainAxis(x, getMinMaxAndAddConstant('X', 10));
        setDomainAxis(y, getMinMaxAndAddConstant('Y', 10));

        yChange();
        xChange();

        removeDots();
        buildDots();
    }

    function removeDots() {
        d3.selectAll('circle').remove();
    }

    function draw() {
        
        //Set domain of values x and y
        setDomainAxis(x, getMinMaxAndAddConstant('X', 10));
        setDomainAxis(y, getMinMaxAndAddConstant('Y', 10));
        
        //Define graph of dots and append of focus
        buildDots();

        //Define axes and append on focus
        buildAxes();

        //Append text on axes
        appendTextOnXAxis('PC1');
        appendTextOnYAxis('PC2');
    }

    return {
        draw: draw,
        redraw: redraw
    };
})();

window.onload = PCAScatterPlotBuilder.draw();

window.onresize = function() {
    console.log("redraw scatter-plot");
    PCAScatterPlotBuilder.redraw();
}