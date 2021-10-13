import { dataSetFactory } from "../dataset.js";

var PCAScatterPlotBuilder = (function() {

    //Global variables
    var data = dataSetFactory.getInstance().data;

    var margin = {top: 20, right: 20, bottom: 110, left: 200},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    //Define svg
    var svg = d3.select("#pca-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    //Append clipPath to svg
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

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

        var dots = focus.append("g");
    
        dots.selectAll("dot")
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
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);
    }

    function appendTextOnXAxis(text) {
        svg.append("text")             
            .attr("transform","translate(" + (width - (margin.right* 2)) + " ," + 
                    (height + (margin.top * 3)) + ")")
            .style("text-anchor", "middle")
            .text(text);
    }

    function appendTextOnYAxis(text) {
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (margin.right * 3))
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(text);  
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
        draw: draw
    };
})();

window.onload = PCAScatterPlotBuilder.draw();