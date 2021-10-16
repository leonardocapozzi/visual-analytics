import { dataSetFactory } from "./dataset/dataset.js";

var width = 500,
height = 680;

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
d3.json("data/manhattan.geojson", function(error, dataGeojson){
	console.log("dataGeojson", dataGeojson);

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
		//.on("click", selectBorough)
		.style("opacity", 0.5)
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);	

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
	//.on("click", selectSeverity)
	//.attr("stroke", "black") //per iniziare con colori già selezionati
	//.attr("stroke-width", 2)
	//.attr("selected",true);
	
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

/*----------------------------------BUBBLE----------------------------------------*/

var BubbleMapBuilder = (function() {

	var data = dataSetFactory.getInstance().data;
	console.log("data", data)

	//Create a tooltip, hidden at the start
	var tooltip = d3.select("#mapId")
	.append("div")
	.attr("class","tooltip");

	//Create a tooltip, hidden at the start
	function showTooltip(d) {
		var date = new Date(d.Start_Time)
		var year = date.getFullYear().toString(); 
		var time1 = date.getTime()
		var date2 = new Date(d.End_Time)
		var time2 = date2.getTime()
		var diff = msToTime(time2-time1) 
		var month = date2.getMonth()
		var day = date2.getDay()
		var season = computeSeason(day, month); 
		tooltip.style("display","block")
		.html("<b>Id:</b> " + d.ID + "<br>" + "<b>Street:</b> " + d.Street + "<br>" + 
		"<b>Severity:</b> " + d.Severity + "<br>" + "<b>Year:</b> " + year +  "<br>" + "<b>D/N:</b> " + d.Sunrise_Sunset + "<br>" + 
		"<b>Zipcode:</b> " + d.Zipcode  + "<br>" + "<b>Duration:</b> " + diff + "<br>" + "<b>Season:</b> " + season);
		d3.select(this).transition()
		.duration(250)
		.attr('r',4)
		.attr('stroke-width',0.5)
	}

	//Move the tooltip to track the mouse
	function moveTooltip() {
	tooltip.style("top",(d3.event.pageY + tooltipOffset.y) + "px")
		.style("left",(d3.event.pageX + tooltipOffset.x) + "px");
	}

	//Create a tooltip, hidden at the start
	function hideTooltip() {
		tooltip.style("display","none");
		d3.select(this).transition()
		.duration(400)
		.attr("r", 2.5)
		.attr("stroke-width", 0.1)
	}

	var selectedBubble = [];

	//color the selected bubble
	function selectBubble(d){
		if (d3.select(this).attr("selected") === "true"){
			d3.select(this)
			.style("fill", function(d){ if (d.Severity == 1.0) return '#fecc5c'; else if(d.Severity == 2.0) return '#fd8d3c'; 
			else if(d.Severity == 3.0) return '#f03b20'; else return '#bd0026';})
			.style("opacity", 0.5)
			.attr("stroke", "black")
			.attr("stroke-width", 0.1)
				.attr("selected",false)
				if(selectedBubble.includes(d.ID)){
					selectedBubble = selectedBubble.filter(b => b !== d.ID)
				}
				console.log(d3.select(this).attr("selected"), selectedBubble)	
		}
		else{
			d3.select(this)
				.style("fill","#74c476")
				.attr("stroke", "white")
				.attr("stroke-width", 0.4)
				.style("opacity", 0.8)
				.attr("selected",true)
				selectedBubble.push(d.ID);
				console.log(d3.select(this).attr("selected"), selectedBubble)		
		}
	}
	
	function buildDots() {
		console.log("given",data)
		d3.select("g") 
		.selectAll("circle")
		.data(data).enter()
		.append("circle")
		.attr("cx", function(d){ return projection([d.Start_Lng, d.Start_Lat])[0] })
        .attr("cy", function(d){ return projection([d.Start_Lng, d.Start_Lat])[1] })
		.attr("r", 2.5)
		.style("fill", function(d){if (d.Severity == 1.0) return '#fecc5c'; else if(d.Severity == 2.0) return '#fd8d3c';
		 	else if(d.Severity == 3.0) return '#f03b20'; else return '#bd0026';})
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
	}

	function redraw(newData) {
        data = newData;

        removeDots();
        buildDots();
    }
	return {
        draw: draw,
        redraw: redraw
    };

})();


/*-------------------TIME-------------------------*/
function msToTime(duration) {

	var seconds = Math.floor((duration / 1000) % 60),
	minutes = Math.floor((duration / (1000 * 60)) % 60),
	hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
  
	return hours + ":" + minutes + ":" + seconds;
}

function computeSeason(day, month){
	if(month == 3 && day >=21 || month == 4 || month == 5 || month == 6 && day <= 21 ) return "Spring";
	else if(month == 6 && day >=22 || month == 7 || month == 8 || month == 9 && day <= 22 ) return "Summer";
	else if(month == 9 && day >=23 || month == 10 || month == 11 || month == 12 && day <= 21 ) return "Autumn";
	else return "Winter";
}



window.onload = BubbleMapBuilder.draw();
export { BubbleMapBuilder }