import { dataSetFactory } from "../dataset.js";

var body = d3.select('#pca-container');

//Variables
var margin = { top: 50, right: 50, bottom: 50, left: 50 }
var h = 500 - margin.top - margin.bottom;
var w = 800 - margin.left - margin.right;
//var formatPercent = d3.format('.2%');


var data = dataSetFactory.getInstance().data;

var focus;

console.log(data[0]['ID']);

console.log(margin.top + " " + margin.left + " " + margin.right + " " + margin.bottom);

// Scales
var colorScale = d3.scale.category10();
var xScale = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +d['X']; }))
    .range([0,w]);
var yScale = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +d['Y']; }))
    .range([h,0]);

var svg = body.append('svg')
    .attr('height',h + margin.top + margin.bottom)
    .attr('width',w + margin.left + margin.right);
    
// X-axis
var xAxis = d3.axisBottom(xScale);
// Y-axis
var yAxis = d3.axisLeft(yScale);

focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Circles
var circles = svg.selectAll('circle')
    .data(data)
    .enter().append('circle')
    .attr('cx',function (d) { return xScale(+d['X']); })
    .attr('cy',function (d) { return yScale(+d['Y']) })
    .attr('r','5')
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
        .duration(500)
        .attr('r',5)
        .attr('stroke-width',1)
    })
    .append('title') // Tooltip
    .text(function (d) { return '\id: ' + d['ID'] +
                                '\nseverity: ' + d['Severity'] });

focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

/*
svg.append('gx')
.attr('class','axis')
.attr('id','xAxis')
.attr('transform', 'translate(0,' + h + ')')
.call(xAxis)
.append('text') // X-axis Label
.attr('id','xAxisLabel')
.attr('y',-10)
.attr('x',w)
.attr('dy','.71em')
.style('text-anchor','end')
.text('PC1');
// Y-axis
svg.append('gy')
.attr('class','axis')
.attr('id','yAxis')
.call(yAxis)
.append('text') // y-axis Label
.attr('id', 'yAxisLabel')
.attr('transform','rotate(-90)')
.attr('x',0)
.attr('y',5)
.attr('dy','.71em')
.style('text-anchor','end')
.text('PC2');
*/