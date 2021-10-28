import { dataSetFactory } from "./dataset/dataset.js";
import { PCAScatterPlotBuilder } from "./pca/pca-script.js";
import { parallelBuilder } from "./parallel.js";
import { UtilsModule } from "./utils/utils.js";

var width = 500,
height = 730;

var margin = { top: -5, right: -5, bottom: -5, left: -5 }

var svg = d3.select("svg") 
.attr("width", width)
.attr("height", height)
.attr("class", "m_map")
.append("g");


// create a unit projection
var projection = d3.geo.albers()
	.scale(1)
	.translate([0,0]);
	
// load geojson 
window.onload = d3.json("resources/manhattan.geojson", function(error, dataGeojson){
	

	// create a path generator
	var path = d3.geo.path()
		.projection(projection);

	// compute bounds of a point of interest, then derive scale and translate
	var b = path.bounds(dataGeojson),
		s = .90 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

	// update the projection to use computed scale and translate
	projection
		.scale(s)
		.translate(t);

	// draw the svg of both the geojson and bounding box
	svg.selectAll("path")
		.data(dataGeojson.features)
		.enter()
		.append("path")
		.attr("d", path)
		.on( "mouseover", showTooltipBorough)
		.on( "mouseout", hideTooltipBorough)
		.on( "mousemove", moveTooltipBorough)
		.style("opacity", 0.5)
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);
		
	BubbleMapBuilder.draw();	

});

//Create a tooltip, hidden at the start
var tooltipBorough = d3.select("#mapId")
	.append("div")
	.attr("class","tooltip");

//Position of the tooltip relative to the cursor
var tooltipOffset = {x: 5, y: -25};

//Create a tooltip, hidden at the start
function showTooltipBorough(d) {
	moveTooltipBorough();
	tooltipBorough.style("display","block")
	.html("<center><b>"+d.properties.name+"</b></center>")
		
	d3.select(this)
	.style("opacity", 0.6)
}

//Move the tooltip to track the mouse
function moveTooltipBorough() {
	tooltipBorough.style("top",(d3.event.pageY + tooltipOffset.y) + "px")
		.style("left",(d3.event.pageX + tooltipOffset.x) + "px");
}

//Create a tooltip, hidden at the start
function hideTooltipBorough() {
	tooltipBorough.style("display","none");
	if(d3.select(this).attr("selected") === "true"){
		d3.select(this)
		.style("opacity", 0.6)
	}
	else{
		d3.select(this)
		.style("opacity", 0.5)
	}
			
}

/*-------------------------------------------SLIDER---------------------------------------*/

var leafletCont= d3.select('#mapId').append('div').attr('class', 'leaflet-control-container')
                                    .append('div').attr('class','leaflet-top leaflet-left').style("margin-top",	"40px")
                                    .append('div').attr('id','slide')
									.attr('class','leaflet-control-zoom leaflet-bar leaflet-control leaflet-zoom-anim')

let container = d3.selectAll("#map g");

var zoom = d3.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomed);

var drag = d3.drag()
	.subject(function (d) { return d; })
	.on("start", dragstarted)
	.on("drag", dragged)
	.on("end", dragended);

var slider = d3.select("#slide").append("p").append("input")
	.datum({})
	.attr("type", "range")
	.attr("value", zoom.scaleExtent()[0])
	.attr("min", zoom.scaleExtent()[0])
	.attr("max", zoom.scaleExtent()[1])
	.attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
	.on("input", slided);


function zoomed() {
	const currentTransform = d3.event.transform;
	container.attr("transform", currentTransform);
	slider.property("value", currentTransform.k);
}
function dragstarted(d) {
	d3.event.sourceEvent.stopPropagation();
	d3.select(this).classed("dragging", true);
}
function dragged(d) {
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
function dragended(d) {
	d3.select(this).classed("dragging", false);
}
function slided(d) {
	zoom.scaleTo(d3.select("#map"), d3.select(this).property("value"));
}	

/*---------------------------------LEGEND-------------------------------------------*/


const colorScale = d3.scaleLinear()
    .domain([1.0, 2.0, 3.0, 4.0]) //value for the legend
    .range(['#fecc5c','#fd8d3c','#f03b20','#bd0026']);
	//.range(['#bdd7e7', '#6baed6', '#3182bd', '#08519c']);	
	
const base_legend = d3.select("body").select('#map').append("rect")
	.attr('id',"recLegendMap").attr("x",15).attr("y",130) 
	.attr("width", 120 ).attr("height", 140 ).attr("rx","12")
	.attr("class", "baseLegend").style('stroke','').style('position', 'fixed')
	
	
const label1 = d3.select("svg").append('g')
	.append("text").text("SEVERITY")
	.attr("x", 35).attr("y", 152) .style('position', 'fixed')

const label2 = d3.select("svg").append('g')
	.append("text").text("GRADE")
	.attr("x", 45).attr("y", 168).style('position', 'fixed')	

const legend = d3.select("svg").append('g').attr('class', 'legend')
	.attr('width', 148).attr('height', 148).selectAll('g')
    .data(colorScale.domain().slice().reverse())
    .enter().append('g').attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect").attr("x", 30).attr("y", 178) 
    .attr("width", 18).attr("height", 18).style("fill", colorScale)
	
legend.append("text").attr("x", 60).attr("y", 188)
    .attr("dy", ".35em").text(function(d) { return d});

const higher = d3.select("svg").append('g').append("text")
    .attr("x", 80).attr("y", 188).attr("dy", ".35em").text("higher");	

const lower = d3.select("svg").append('g').append("text")
    .attr("x", 80).attr("y", 248).attr("dy", ".35em").text("lower");	

const line = d3.select("svg").append("line")
	.attr("x1", 98).attr("y1", 200).attr("x2", 98).attr("y2", 242)
	.style('stroke','black').style('stroke-width',2)

const row_left = d3.select("svg").append("line")
	.attr("x1", 98).attr("y1", 200.5).attr("x2", 90).attr("y2", 214)
	.style('stroke','black').style('stroke-width',2)
	
const row_right = d3.select("svg").append("line")
	.attr("x1", 98).attr("y1", 200.5).attr("x2", 106).attr("y2", 214)
	.style('stroke','black').style('stroke-width',2)	

/*---------------------------------COMPUTE MEAN TIME--------------------------*/


const show_time = d3.select("body").select('#map').append("rect")
	.attr('id',"recLegendMap").attr("x",400).attr("y",680) 
	.attr("width", 140 ).attr("height", 100 ).attr("rx","12")
	.attr("class", "baseLegend").style('stroke','').style('position', 'fixed')

const label3 = d3.select("svg").append('g')
	.append("text").text("MEAN ACCIDENT")
	.attr("x", 404).attr("y", 705) .style('position', 'fixed')

const label4 = d3.select("svg").append('g')
	.append("text").text("Time: ").attr("dy", ".35em")
	.attr("x", 410).attr("y", 725) .style('position', 'fixed')	


const label5 = d3.select("svg").append('g')
	.append("text").text("Duration: ").attr("dy", ".35em")
	.attr("x", 410).attr("y", 745) .style('position', 'fixed')

const label6 = d3.select("svg").append('g')
	.append("text").text("Severity: ").attr("dy", ".35em")
	.attr("x", 410).attr("y", 765) .style('position', 'fixed')	

var mTime =	d3.select("body").select('#map').append("text")

var mDuration =	d3.select("body").select('#map').append("text")
		
var mSeverity =	d3.select("body").select('#map').append("text")

/*----------------------------------BUBBLE----------------------------------------*/

var BubbleMapBuilder = (function() {

	var data = dataSetFactory.getInstance().data;

	//Create a tooltip, hidden at the start
	var tooltip = d3.select("#mapId")
	.append("div")
	.attr("class","tooltip");

	//Create a tooltip, hidden at the start
	function showTooltip(d) {
		var date = new Date(d.Start_Time)
		var year = date.getFullYear().toString(); 
		var time1 = date.getTime()
		var hour = msToTime(time1)
		var date2 = new Date(d.End_Time)
		var time2 = date2.getTime()
		var diff = msToTime(time2-time1) 
		var month = date2.getMonth()
		var day = date2.getDay()
		var season = computeSeason(day, month); 
		tooltip.style("display","block")
		.html("<b>Id:</b> " + d.ID + "<br>" + "<b>Street:</b> " + d.Street + "<br>" + "<b>Zipcode:</b> "+ d.Zipcode + "<br>" +
		"<b>Severity:</b> " + d.Severity + "<br>" + "<b>Year:</b> " + year +  "<br>" + "<b>D/N:</b> " + d.Sunrise_Sunset + "<br>" + 
		"<b>Time:</b> " + hour + "<br>" + "<b>Duration:</b> " + diff + "<br>" + "<b>Season:</b> " + season );
		d3.select(this).transition()
		.duration(250)
		.attr('r',4)
		.attr('stroke-width',0.5)

		PCAScatterPlotBuilder.singleHighlight(d);
		parallelBuilder.singleHighlight(d);
	}

	//Move the tooltip to track the mouse
	function moveTooltip() {
	tooltip.style("top",(d3.event.pageY + tooltipOffset.y) + "px")
		.style("left",(d3.event.pageX + tooltipOffset.x) + "px");
	}

	//Create a tooltip, hidden at the start
	function hideTooltip(d) {
		tooltip.style("display","none");
		d3.select(this).transition()
		.duration(400)
		.attr("r", 2.5)
		.attr("stroke-width", 0.1)

		PCAScatterPlotBuilder.resetSingleHighlight(d);
		parallelBuilder.resetSingleHighlight(d);
	}

	var selectedBubble = [];
	var meanTime, meanDuration, meanSeverity;

	//color the selected bubble
	function selectBubble(d){
		
		if (d3.select(this).attr("selected") === "true"){
			d3.select(this)
			.style("fill", function(d){ return colorBubble(d.Severity) ;})
			.style("opacity", 0.5)
			.attr("stroke", "black")
			.attr("stroke-width", 0.1)
			.attr("selected",false)
		
			if(selectedBubble.length >= 0){
				selectedBubble = selectedBubble.filter(b => b !== d)
				PCAScatterPlotBuilder.highlight(selectedBubble);
				parallelBuilder.highlight(selectedBubble)
				
			}
			else{
				PCAScatterPlotBuilder.redraw(data);
				parallelBuilder.redraw(data);	
			}
		}
		else{
			d3.select(this)
				.style("fill","#2fcc3a")
				.attr("stroke", "white")
				.attr("stroke-width", 0.4)
				.style("opacity", 0.8)
				.attr("selected",true)
			selectedBubble.push(d)
			
			PCAScatterPlotBuilder.highlight(selectedBubble)
			parallelBuilder.highlight(selectedBubble)
	
		}
		computeMean(selectedBubble);
	}

	
	function computeMean(selected) {
		console.log("mean", selected)
		var times = [];
		var durations = [];
		var severities = [];
		if(selected.length > 0){
			for(var i = 0; i < selected.length; i++){
				var date = new Date(selected[i].Start_Time)
				var time = date.getTime()	
				times.push(time)
				var date2 = new Date(selected[i].End_Time)
				var time2 = date2.getTime()
				var duration = time2-time	
				durations.push(duration)
				var severity = parseFloat(selected[i].Severity)
				severities.push(severity)	
			}
			
		}
		else{
			for(var i = 0; i < data.length; i++){
				var date = new Date(data[i].Start_Time)
				var time = date.getTime()	
				times.push(time)
				var date2 = new Date(data[i].End_Time)
				var time2 = date2.getTime()
				var duration = time2-time	
				durations.push(duration)
				var severity = parseFloat(data[i].Severity)
				severities.push(severity)			
			}
	
		}
		
		var i = 0, j = 0, k = 0, 
		sumTime = 0, sumDuration = 0, sumSeverity = 0,
		lenT = times.length, lenD = durations.length, lenS = severities.length;
		
		while (i < lenT) {
			sumTime = sumTime + times[i++]
		}
		while(j < lenD){
			sumDuration = sumDuration + durations[j++]
		}
		while(k < lenS){
			sumSeverity = sumSeverity + severities[k++]
		}
		
		var meanT = sumTime / lenT
		meanTime = msToTime(meanT)
		mTime.attr("x", 475).attr("y", 725).attr("dy", ".35em").text(meanTime)

		var meanD = sumDuration / lenD
		meanDuration = msToTime(meanD)
		mDuration.attr("x", 475).attr("y", 745).attr("dy", ".35em").text(meanDuration)

		meanSeverity = (sumSeverity / lenS).toFixed(2)
		mSeverity.attr("x", 475).attr("y", 765).attr("dy", ".35em").text(meanSeverity)
		
	}

	
	function msToTime(duration) {

		var seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	  
		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;
	  
		return hours + ":" + minutes + ":" + seconds;
	}
	
	function colorBubble(severity){
		if (severity == 1.0) return '#FECC5C'; 
		else if(severity == 2.0) return '#FD8D3C';
		else if(severity == 3.0) return '#F03B20'; 
		else return '#BD0026';
	}
	
	function buildDots() {
	
		d3.select("g") 
		.selectAll("circle")
		.data(data).enter()
		.append("circle")
		.attr("cx", function(d){ return projection([d.Start_Lng, d.Start_Lat])[0] })
        .attr("cy", function(d){ return projection([d.Start_Lng, d.Start_Lat])[1] })
		.attr("r", 2.5)
		.style("fill", function(d){ return colorBubble(d.Severity); })
		.style("opacity", 0.7)
		.attr("stroke", "black")
		.attr("stroke-width", 0.1)
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.on( "mouseover", showTooltip)
		.on( "mouseout", hideTooltip)
		.on( "mousemove", moveTooltip)
		.on( "click" , selectBubble )
		.call(zoom)	

	}  

	function removeDots() {
		d3.select("g") 
		.selectAll("circle").remove()
	}

	function draw(){
		buildDots();
		computeMean(data);
	}

	function redraw(newData) {
        data = newData;

        removeDots();
        buildDots();
		computeMean(data);
    }

	var shProperties = {
        oldFill: undefined,
        oldObj: undefined
    }

	function onPointerOver(elem){

		var circle = d3.select("g") 
			.selectAll("circle")
			.filter(d => elem.ID == d.ID)
        	.transition()
			.duration(250)
			.attr('r', 8)
			.attr('stroke-width', 1.5)

		shProperties.oldObj = elem;
        shProperties.oldFill = circle.attr('fill')
		console.log( shProperties.oldFill)

        if(shProperties.oldFill == '#74C67A') {
            circle.attr('fill', 'blue')
        }
        else {
            circle.attr('fill', '#74C67A') //'#74C67A'
        }

	}

	function onPointerOut(elem){

		if(shProperties.oldFill == undefined) {
            shProperties.oldFill = colorBubble(elem.Severity);
        } 
		d3.select("g") 
			.selectAll("circle")
			.filter(d => elem.ID == d.ID)
			.attr('fill', shProperties.oldFill)
        	.transition()
			.duration(400)
			.attr('r',2.5)
			.attr('stroke-width', 0.1)

		shProperties.oldFill = undefined;	
		
	}

	function highlight(data){
		console.log(data)

		var mapData = UtilsModule.buildMapFromArray(data);
		console.log(mapData)

		if(shProperties.oldObj !== undefined && 
			mapData.get(shProperties.oldObj.ID) !== undefined) {
			console.log("qui")
			shProperties.oldFill = '#74C67A'
			console.log(shProperties.oldFill)
		  }
		  else if(shProperties.oldObj !== undefined && mapData.get(shProperties.oldObj.ID) == undefined) {
			shProperties.oldFill = colorBubble(shProperties.oldObj.Severity)
			console.log("ciao")
		  }
	  

		
		d3.select("g") 
		.selectAll("circle")
		.attr('fill',function (d) {
			if(mapData.get(d.ID) !== undefined) {
				console.log("holaaaa")
				return '#74C67A';
			}

			return colorBubble(d.Severity);
		});
	
			/*circle
			.filter(function(d) {return d => newData.ID == d.ID}) 		
			.style("fill","#2fcc3a")
			.attr("stroke", "black")
			.attr("stroke-width", 0.4)
			.style("opacity", 0.8)
			.transition()
            .duration(400)
        	.attr('r',6)
			.transition()
            .duration(400)
        	.attr('r',3.5)*/
		
		//selectedBubble = data;	
		computeMean(data);

	}

	return {
        draw: draw,
        redraw: redraw,
		highlight : highlight,
		onPointerOver : onPointerOver,
		onPointerOut : onPointerOut
    };

})();


/*-------------------TIME-------------------------*/

function computeSeason(day, month){
	if(month == 3 && day >=21 || month == 4 || month == 5 || month == 6 && day <= 21 ) return "Spring";
	else if(month == 6 && day >=22 || month == 7 || month == 8 || month == 9 && day <= 22 ) return "Summer";
	else if(month == 9 && day >=23 || month == 10 || month == 11 || month == 12 && day <= 21 ) return "Autumn";
	else return "Winter";
}



export { BubbleMapBuilder }