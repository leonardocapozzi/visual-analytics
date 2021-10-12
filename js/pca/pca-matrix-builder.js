import { dataSetFactory } from "../dataset.js";
import { matrixOperations } from "./utils/matrix-operations.js";

var PCAMatrixBuilder = (function() {

    var margin = {top: 20, right: 20, bottom: 110, left: 50},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

    function buildScatterPlot() {
        var body = d3.select('pca-container');

        //Variables
        var margin = { top: 50, right: 50, bottom: 50, left: 50 }
        var h = 500 - margin.top - margin.bottom;
        var w = 500 - margin.left - margin.right;
        var formatPercent = d3.format('.2%');


        var data = dataSetFactory.getInstance().data;

        console.log("entro?");

        // Scales
        var colorScale = d3.scale.category20();
        var xScale = d3.scale.linear()
            .domain([
            d3.min([0,d3.min(data,function (d) { return d['X'] })]),
            d3.max([0,d3.max(data,function (d) { return d['Y'] })])
            ])
            .range([0,w]);
        var yScale = d3.scale.linear()
            .domain([
            d3.min([0,d3.min(data,function (d) { return d['X'] })]),
            d3.max([0,d3.max(data,function (d) { return d['Y'] })])
            ])
            .range([h,0]);

            var svg = body.append('svg')
            .attr('height',h + margin.top + margin.bottom)
            .attr('width',w + margin.left + margin.right)
          .append('g')
            .attr('transform','translate(' + margin.left + ',' + margin.top + ')');
        // X-axis
        var xAxis = d3.svg.axis()
          .scale(xScale)
          .tickFormat(formatPercent)
          .ticks(5)
          .orient('bottom');
        // Y-axis
        var yAxis = d3.svg.axis()
          .scale(yScale)
          .tickFormat(formatPercent)
          .ticks(5)
          .orient('left');
        // Circles
        var circles = svg.selectAll('circle')
            .data(data)
            .enter()
          .append('circle')
            .attr('cx',function (d) { return xScale(d['X']) })
            .attr('cy',function (d) { return yScale(d['Y']) })
            .attr('r','10')
            .attr('stroke','black')
            .attr('stroke-width',1)
            .attr('fill',function (d,i) { return colorScale(i) })
            .on('mouseover', function () {
              d3.select(this)
                .transition()
                .duration(500)
                .attr('r',20)
                .attr('stroke-width',3)
            })
            .on('mouseout', function () {
              d3.select(this)
                .transition()
                .duration(500)
                .attr('r',10)
                .attr('stroke-width',1)
            })
          .append('title') // Tooltip
            .text(function (d) { return d.variable +
                                 '\id: ' + formatPercent(d['ID']) +
                                 '\nseverity: ' + formatPercent(d['Severity']) });

        // X-axis
        svg.append('g')
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
        svg.append('g')
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
    }


    function getPCAMatrix() {
        console.log("Call 'getPCAMatrix function");

        var data = dataSetFactory.getInstance().data;
        var map = buildDataMapForPCAAlgorithm(data);

        var matrix = Array.from(map.values());

        /*
        var testArray = [
            [-0.8, 0, 1.6],
            [-1.8, 0, -0.4],
            [0.2, 1, -0.4],
            [2.2, -1, -1.4],
            [0.2, 0, 0.6]
        ];
        */

        var pcaMatrix = matrixOperations.pcaMatrix(matrix);

        addXandYPCAProperties(data, pcaMatrix);
    }

    function addXandYPCAProperties(data, pcaMatrix) {
        for(var i = 0; i < pcaMatrix.length; i ++) {
            var item = data[i];
            
            item["X"] = pcaMatrix[i][0] + '';
            item["Y"] = pcaMatrix[i][1] + '';
        }
    }

    function buildDataMapForPCAAlgorithm(data) {
        var map = new Map();

        _.map(_.where(data), function(acc) {
            var array = new Array();

            array[0] = acc["Severity"];
            array[1] = acc["Precipitation"];
            array[2] = acc["Pressure"];
            array[3] = acc["Visibility"];
            array[4] = acc["Humidity"];
            array[5] = acc["Wind_Chill"];

            map.set(acc["ID"], array); 
        });

        return map;
    }

    function drawScatterPlot() {
        buildScatterPlot(getPCAMatrix());
    }

    return {
        pcaMatrix: getPCAMatrix()
    }
})();

export { PCAMatrixBuilder }