import { dataSetFactory } from "../dataset.js";

var margin = {top: 20, right: 20, bottom: 110, left: 200},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

var data = dataSetFactory.getInstance().data;

var svg = d3.select("#pca-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xMinMax = d3.extent(data, function(d) { return +d['X']; });
xMinMax[0] = xMinMax[0] - 10;
xMinMax[1] = xMinMax[1] + 10;

var yMinMax = d3.extent(data, function(d) { return +d['Y']; });
yMinMax[0] = yMinMax[0] - 10;
yMinMax[1] = yMinMax[1] + 10;

x.domain(xMinMax);
y.domain(yMinMax);

var colorScale = d3.scale.category20();

var dots = focus.append("g");

//dots.attr("clip-path", "url(#clip)");
    
dots.selectAll("dot")
    .data(data)
    .enter().append('circle')
    .attr('cx',function (d) { return x(+d['X']); })
    .attr('cy',function (d) { return y(+d['Y']) })
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
        .duration(400)
        .attr('r',5)
        .attr('stroke-width',1)
    })
    .append('title')
    .text(function (d) { return '\id: ' + d['ID'] +
                                '\nseverity: ' + d['Severity'] });
        
        
focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);
    
focus.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.right * 3))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text('PC2');  
    
svg.append("text")             
    .attr("transform",
            "translate(" + (width - (margin.right* 2)) + " ," + 
                        (height + (margin.top * 3)) + ")")
    .style("text-anchor", "middle")
    .text('PC1');