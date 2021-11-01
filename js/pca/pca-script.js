import { dataSetFactory } from "../dataset/dataset.js";
import { parallelBuilder } from "../parallel.js";
import { BubbleMapBuilder } from "../map.js";
import { UtilsModule } from "../utils/utils.js";

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

    var brush=d3.brush()
        .extent([[0,0],
            [svgClientSize.width-(padding.right * 4), svgClientSize.height-(padding.right * 2)]])
        .on("brush", selected)
        .on("end", reset);

    var dots;

    var dataSelection = [];

    //Append clipPath to svg
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w + '%')
        .attr("height", h + '%');

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

        dots = context.append("g");
    
        dots.selectAll("circle")
            .data(data)
            .enter().append('circle')
            .attr('cx',function (d) { return x(+d['X']); })
            .attr('cy',function (d) { return y(+d['Y']) })
            .attr('r',4)
            .attr('stroke','black')
            .attr('stroke-width',0.2)
            .attr('fill',function (d,i) { return '#31a354'})
            .style("opacity", 0.5)
            .on('mouseover', function (d) {
                singleHighlight(d);
                parallelBuilder.singleHighlight(d);
                BubbleMapBuilder.onPointerOver(d);
            })
            .on('mouseout', function (d) {                
                resetSingleHighlight(d);
                parallelBuilder.resetSingleHighlight(d);
                BubbleMapBuilder.onPointerOut(d);
            })
            .append('title')
            .text(function (d) { return '\id: ' + d['ID'] });
    }

    function buildBrush() {
        context.append("g")
            .attr("class", "brush")
            .call(brush);
    }

    function resetCircleProperty() {
        context.selectAll("circle")
            .style("fill",function(d) {return '#31a354'})
            .style("opacity","0.5")
    }

    function reset() {

        var selection= d3.event.selection;

        if(selection == null) {
            resetCircleProperty();

            BubbleMapBuilder.redraw(data);
            parallelBuilder.redraw(data);
            redraw(data);
        }
        else {
            parallelBuilder.highlight(dataSelection);
            BubbleMapBuilder.highlight(dataSelection);
            highlight(dataSelection);
        }
    }
  
    function selected(){
        dataSelection = [];

        var selection= d3.event.selection;
     
        if (selection != null) {
            context.selectAll("circle")
                .style("opacity",function(d){
                    if ((x(d['X']) > selection[0][0]) && (x(d['X']) < selection[1][0]) && 
                        (y(d['Y']) > selection[0][1]) && (y(d['Y']) < selection[1][1])) {
                        dataSelection.push(d)
                        return "0.7"
                    }
                    return "0.3"});
        }
        else
        {
            resetCircleProperty()
        }
    }

    function buildAxes() {
        context.append("g")
            .attr("id", "xAxis")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        context.append("g")
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
        context.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (svgClientSize.height / 2) + margin.bottom)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(text);  
    }
    
    function yChange() {
        d3.select('#yAxis')
            .transition().duration(100)
            .call(yAxis)  
        }

    function xChange() {
        d3.select('#xAxis')
            .transition().duration(100)
            .call(xAxis)
    }

    function resize() {

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
        context.selectAll('circle').remove();
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

        //Build brush
        buildBrush();
    }

    function redraw(newData) {
        data = newData;

        setDomainAxis(x, getMinMaxAndAddConstant('X', 10));
        setDomainAxis(y, getMinMaxAndAddConstant('Y', 10));

        yChange();
        xChange();

        removeDots();
        buildDots();
    }

    var shProperties = {
        oldFill: undefined,
        oldObj: undefined
    };

    function singleHighlight(elem) {

        var circle = context
            .selectAll('circle')
            .filter(d => elem.ID == d.ID)
        
        context
            .selectAll('circle').sort(function (a, b) {
                if (a.ID == elem.ID) return 1;               
                else return -1;
            });

        shProperties.oldObj = elem;
        shProperties.oldFill = circle._groups[0][0].getAttribute("fill");

        if(shProperties.oldFill == "red") {
            circle.attr('fill', 'blue')
        }
        else {
            circle.attr('fill', 'red')
        }

        circle
            .attr('opacity', 0.9)
            .attr('r', '10');
    }

    function resetSingleHighlight(elem) {

        if(shProperties.oldFill == undefined) {
            shProperties.oldFill = '#31a354';
        }   

        context
            .selectAll('circle')
            .filter(d => elem.ID == d.ID)
            .attr('fill', shProperties.oldFill)
            .attr('opacity', 0.5)
            .attr('r', '4');

        shProperties.oldFill = undefined;
    }

    function highlight(data) {
        var mapData = UtilsModule.buildMapFromArray(data);

        if(shProperties.oldObj !== undefined && 
            mapData.get(shProperties.oldObj.ID) !== undefined) {
            shProperties.oldFill = 'red';
        }
        else {
            shProperties.oldFill = '#31a354';
        }

        context
            .selectAll('circle').sort(function (a, b) {
                if (mapData.get(a.ID) !== undefined) return 1;               
                else return -1;
            });

        context
            .selectAll('circle')
            .attr('fill',function (d) {
                if(mapData.get(d.ID) !== undefined) {
                    return 'red';
                }

                return '#31a354';
            });
    }

    return {
        draw: draw,
        redraw: redraw,
        resize: resize,
        highlight: highlight,
        singleHighlight: singleHighlight,
        resetSingleHighlight: resetSingleHighlight
    };
})();

window.onload = PCAScatterPlotBuilder.draw();

window.onresize = function() {
    PCAScatterPlotBuilder.resize();
}

export { PCAScatterPlotBuilder }