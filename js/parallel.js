import { dataSetFactory } from "./dataset/dataset.js";
import { BubbleMapBuilder } from "./map.js";
import { PCAScatterPlotBuilder } from "./pca/pca-script.js";

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
         
        if (!isNaN(parseFloat( acc["Severity"])) &&
            !isNaN(parseFloat(acc["Precipitation"]))&&
            !isNaN(parseFloat( acc["Pressure"])) &&
            !isNaN(parseFloat( acc["Visibility"])) &&
            !isNaN(parseFloat (acc["Humidity"])) &&
            !isNaN(parseFloat(acc["Wind_Speed"])) &&
            !isNaN(parseFloat( acc["Temperature"])) &&
            acc.Sunrise_Sunset !== ""){
                map.set(acc["ID"], acc); 
            }
    });

    return map;
  }

  var dim;

  function drawParallel(dataset) {

    var map = buildDataMapForPCAAlgorithm(dataset);
    var data = Array.from(map.values());
  
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

    var property = ['Severity', 'Precipitation', 'Pressure', 'Visibility', 'Humidity', 'Wind_Speed', 'Temperature'];

    x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
      if (!property.includes(d)) {
          return false;
      }
      return y[d] = d3.scaleLinear()
          .domain(d3.extent(data, function(p) { 
              return +p[d]; }))
          .range([300, 0]);
    }));

    //dimensions.pop(); //levo quell'id automatico che si mette nel parallel, in pratica quella colonna in più che si forma
    var colonnaColore= dimensions.pop(); //e levo anche la colonna sunset_sunrise che mi serve per i colori
    
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
        .style("stroke-width", 1.2)
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
          d3.select(this).call(y[d].brush = 
            d3.brushY().extent([[-8, 0], [8,290]])
              .on("brush start", brushstart)
              .on("brush", brush_parallel_chart)
              .on("end", brush_end));
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

  function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

  var lineSelected = [];

  function brush_end() {

    var selection = d3.event.selection;

    if(selection == null) {
      PCAScatterPlotBuilder.redraw(data);
      BubbleMapBuilder.redraw(data);
      drawParallel(data);
    }
    /* (1-PCA-REALTIME-HIGHLIGHT) comment 'else' condition to highlight in real time the PCA dots */
    else {
      PCAScatterPlotBuilder.highlight(lineSelected);
    }
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush_parallel_chart() {    
    for(var i=0;i<dimensions.length;++i){
        if(d3.event.target==y[dimensions[i]].brush) {
            extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);

        }
    }

    var cloneLineSelected = clone(lineSelected);
  
    foreground.style("display", function(d) {
      var ret = dimensions.every(function(p, i) {
        if(extents[i][0]==0 && extents[i][0]==0) {
            return true;
        }
        return extents[i][1] <= d[p] && d[p] <= extents[i][0];
      }) ? null : "none";

      if(ret == null) {
        var flag = false;
        for(var i = 0; i < cloneLineSelected.length; i++) {
          if(cloneLineSelected[i].ID == d.ID) {
            flag = true;
          }
        }

        if(!flag) {
          cloneLineSelected.push(d);
        }
      }
      else {
        for(var i = 0; i < cloneLineSelected.length; i ++) {
          if(cloneLineSelected[i].ID == d.ID) {
            cloneLineSelected.splice(i, 1);
          }
        }
      }

      if(lineSelected !== cloneLineSelected) {
        BubbleMapBuilder.redraw(lineSelected);
        
        /* (2-PCA-REALTIME-HIGHLIGHT) uncomment to highlight in real time the PCA dots */
        //PCAScatterPlotBuilder.highlight(lineSelected);
        
        lineSelected = cloneLineSelected;
      }

      lineSelected = cloneLineSelected;

      return ret;
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









