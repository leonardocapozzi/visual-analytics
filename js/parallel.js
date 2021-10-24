import { dataSetFactory } from "./dataset/dataset.js";

//////////DISEGNO PARALLEL////////////
var parallelBuilder = (function() {

  //colore Day/Night
  // Color scale: give me a specie name, I return a color
  var coloriamo = d3.scaleOrdinal()
    .domain(["Day", "Night" ])
    .range([ "#f79256", "#315e26"]);

  var margin = {top: 30, right: 10, bottom: 10, left: 10},
        width = 100,
        height = 100;

  var svg = d3.select("#parallelArea").append("svg")
    .attr("width", width + '%')
    .attr("height", height +'%')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

  var dim;

  function drawParallel(dataset) {

    var data = Array.from(buildDataMapForPCAAlgorithm(dataset).values());
  
    var line = d3.line(),
        background,
        foreground,
        extents;
  
    // Extract the list of dimensions and create a scale for each.
    //data[0] contains the header eleSments, then for all elements in the header
    //different than "name" it creates and y axis in a dictionary by variable name
    var dimensions;

    var x = d3.scaleBand().rangeRound([0, 1200]).padding(.1),
      y = {},
      dragging = {};

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
          d3.select(this).style("stroke", "#d7191c")})
        .on("mouseout", function(d){
            d3.select(this).style("stroke", function(d){ return( coloriamo(d.Sunrise_Sunset))} )});

   // Add a group element for each dimension.
    var g = svg.selectAll("dimension")
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
    
    dim = g;

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
          d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8,290]]).on("brush start", brushstart).on("brush", brush_parallel_chart));
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
  function removeLines() {

    var dayLine = d3.selectAll('path.line.Day');
    var nightLine = d3.selectAll('path.line.Night');

    var backgroundLine = d3.selectAll('path.backpath');

    var dimension = d3.selectAll('g.dimension');

    dimension.remove();
    backgroundLine.remove();
    dayLine.remove();
    nightLine.remove();
  }

  function draw(){
    drawParallel(dataSetFactory.getInstance().data);
  }

  function redraw(newData){
    removeLines();
    drawParallel(newData);
  }

  return {
    draw: draw,
    redraw: redraw
  }

})();

export { parallelBuilder } 

window.onload = parallelBuilder.draw();









