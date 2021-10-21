import { dataSetFactory } from "./dataset/dataset.js";

var chiavi

var dataSelection=[];

var margin = {top: 20, right: 20, bottom: 110, left: 50},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = 100,
    height = 100,
    height2 =100;

var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);


    
var focus;

var dati

var color= d3.scaleOrdinal(d3.schemeCategory10);


var dataset =  dataSetFactory.getInstance().data;
console.log("dataset: " ,dataset);

function buildDataMapForPCAAlgorithm(data) {
    var map = new Map();

    _.map(_.where(data), function(acc) {
       

        var x = {Severity:parseFloat( acc["Severity"]),
         Precipitation: parseFloat(acc["Precipitation"]),
         Pressure: parseFloat( acc["Pressure"]),
         Visibility:parseFloat( acc["Visibility"]),
         Humidity: parseFloat (acc["Humidity"]),
         Wind_speed: parseFloat(acc["Wind_Speed"]),
         Temperature: parseFloat( acc["Temperature"]),
         Sunrise_Sunset: acc["Sunrise_Sunset"]};
        
         
        if (!isNaN(x.Severity) &&
            !isNaN(x.Precipitation )&&
            !isNaN(x.Pressure) &&
            !isNaN(x.Visibility) &&
            !isNaN(x.Humidity) &&
            !isNaN(x.Wind_speed) &&
            !isNaN(x.Temperature) &&
            x.Sunrise_Sunset !== ""){
                map.set(acc["ID"], x); 

            }
        
    
    });
    

    return map;
}

var data= Array.from(buildDataMapForPCAAlgorithm(dataset).values());
console.log("data: " ,data);
window.onload = drawParallel(data);

//////////DISEGNO PARALLEL////////////

function drawParallel(data){

  //colore Day/Night
   // Color scale: give me a specie name, I return a color
   var coloriamo = d3.scaleOrdinal()
    .domain(["Day", "Night" ])
    .range([ "#f79256", "#315e26"])



var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 100,
    height = 100;




var line = d3.line(),
    //axis = d3.axisLeft(x),
    background,
    foreground,
    extents;

var svg = d3.select("#parallelArea").append("svg")
    .attr("width", width + '%')
    .attr("height", height +'%')
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgClientSize = svg.node().getBoundingClientRect();
console.log("svg: " + svgClientSize.width);
var x = d3.scaleBand().rangeRound([0, 1200]).padding(.1),
    y = {},
    dragging = {};

  // Extract the list of dimensions and create a scale for each.
    //data[0] contains the header eleSments, then for all elements in the header
    //different than "name" it creates and y axis in a dictionary by variable name
 var dimensions;
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    if ((d == "X") || (d == "Y")) {
        return false;
    }
    return y[d] = d3.scaleLinear()
        .domain(d3.extent(data, function(p) { 
            return +p[d]; }))
        .range([300, 0]);
  }));
  //dimensions.pop(); //levo quell'id automatico che si mette nel parallel, in pratica quella colonna in più che si forma
  var colonnaColore= dimensions.pop(); //e levo anche la colonna sunset_sunrise che mi serve per i colori
  //console.log(colonnaColore);
  
  extents = dimensions.map(function(p) { return [0,0]; });

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("class","backpath")
      .attr("d", path);
      

      
      

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("class","forepath")
      .attr("d", path)
      .attr("class", function (d) { return "line " + d.Sunrise_Sunset } ) // 2 class for each line: 'line' and the group name
      .style("stroke", function(d){ return( coloriamo(d.Sunrise_Sunset))} )
   

      
      .on("mouseover", function(){
        d3.select(this).raise().classed("active", true);
        d3.select(this).style("stroke", "#d7191c")
        
        
        })

      .on("mouseout", function(d){
          d3.select(this).style("stroke", function(d){ return( coloriamo(d.Sunrise_Sunset))} )

    
      });

    
 // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
      .call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on("start", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));
  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) {  d3.select(this).call(d3.axisLeft(y[d]));})
      //text does not show up because previous line breaks somehow
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8,height]]).on("brush start", brushstart).on("brush", brush_parallel_chart));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}





// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
 
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}


// Handles a brush event, toggling the display of foreground lines.
function brush_parallel_chart() {    
    for(var i=0;i<dimensions.length;++i){
        if(d3.event.target==y[dimensions[i]].brush) {
            extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);

        }
    }

      foreground.style("display", function(d) {
        return dimensions.every(function(p, i) {
            if(extents[i][0]==0 && extents[i][0]==0) {
                return true;
            }
          return extents[i][1] <= d[p] && d[p] <= extents[i][0];
        }) ? null : "none";
      });
}

}
/////////FINE DISEGNO PARALLEL////////







