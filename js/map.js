var width = 600,
height = 700;

var margin = { top: -5, right: -5, bottom: -5, left: -5 }

var svg = d3.select("svg") 
.attr("width", width)
.attr("height", height)
.attr("class", "svg")
.append("g");

// create a unit projection
var projection = d3.geo.albers()
	.scale(1)
	.translate([0,0]);

// load geojson 
d3.json("data/manhattan.geojson", function(error, data){
	console.log("data", data);

	// create a path generator
	var path = d3.geo.path()
		.projection(projection);

	// compute bounds of a point of interest, then derive scale and translate
	var b = path.bounds(data),
		s = .90 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

	// update the projection to use computed scale and translate
	projection
		.scale(s)
		.translate(t);

	// draw the svg of both the geojson and bounding box
	svg.selectAll("path")
		.data(data.features)
		.enter()
		.append("path")
		.attr("d", path)
		.on( "mouseover", showTooltip)
		.on( "mouseout", hideTooltip)
		.on( "mousemove", moveTooltip)
		.on("click", selectBorough)
		.style("opacity", 0.7)
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);	

});

var selectedBoroughs = [];

//color the selected borough
function selectBorough(d){
	if (d3.select(this).attr("selected") === "true"){
		d3.select(this)
		.style("fill", "black")
			.attr("selected",false)
			if(selectedBoroughs.includes(d.properties.name)){
				selectedBoroughs = selectedBoroughs.filter(boro => boro !== d.properties.name)
			}
			console.log(d3.select(this).attr("selected"), selectedBoroughs)
		
	}
	else{
		d3.select(this)
			.style("fill","yellow")
			.style("opacity", 2)
			.attr("selected",true)
			selectedBoroughs.push(d.properties.name);
			console.log(d3.select(this).attr("selected"), selectedBoroughs)		
	}
	
}

//Create a tooltip, hidden at the start
var tooltip = d3.select("#mapId")
	.append("div")
	.attr("class","tooltip");

//Position of the tooltip relative to the cursor
var tooltipOffset = {x: 5, y: -25};

//Create a tooltip, hidden at the start
function showTooltip(d) {
	moveTooltip();
	tooltip.style("display","block")
		.text(d.properties.name);
	d3.select(this)
	.style("opacity", 2)

}

//Move the tooltip to track the mouse
function moveTooltip() {
	tooltip.style("top",(d3.event.pageY + tooltipOffset.y) + "px")
		.style("left",(d3.event.pageX + tooltipOffset.x) + "px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
	tooltip.style("display","none");
	if(d3.select(this).attr("selected") === "true"){
		d3.select(this)
		.style("opacity", 2)
	}
	else{
		d3.select(this)
		.style("opacity", 0.7)
	}
			
}

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

/*-----------------------SLIDER----------------------*/

var leafletCont= d3.select('#mapId').append('div').attr('class', 'leaflet-control-container')
                                    .append('div').attr('class','leaflet-top leaflet-left')
                                    .append('div').attr('id','slide')
									.attr('class','leaflet-control-zoom leaflet-bar leaflet-control leaflet-zoom-anim')

let container = d3.selectAll("svg g");

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
	zoom.scaleTo(d3.selectAll("svg"), d3.select(this).property("value"));
}	

/*------------LEGEND------------*/


const colorScale = d3.scaleLinear()
    .domain([2,10, 20, 30, 40]) //value for the legend
    .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);	
	

const base_legend = d3.select("body").selectAll('svg')
	.append("rect")
	.attr('id',"recLegendMap")
	.attr("x",15)
	.attr("y",100) 
	.attr("width", 120 )
	.attr("height", 160 )
	.attr("rx","12")
	.attr("class", "baseLegend")
	.style('stroke','')
	.style('position', 'fixed')
	
	
const label1 = d3.select("svg").append('g')
	.append("text")
	.text("NUMBER OF")
	.attr("x", 27)
	.attr("y", 122) 
	.style('position', 'fixed')

const label2 = d3.select("svg").append('g')
	.append("text")
	.text("ACCIDENTS")
	.attr("x", 28)
	.attr("y", 138) 
	.style('position', 'fixed')	

const legend = d3.select("svg").append('g')
    .attr('class', 'legend')
	.attr('width', 148)
    .attr('height', 148)
	.selectAll('g')
    .data(colorScale.domain().slice().reverse())
    .enter().append('g')
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
	.attr("x", 32)
	.attr("y", 145) 
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);
	
legend.append("text")
    .attr("x", 62)
    .attr("y", 155)
    .attr("dy", ".35em")
    .text(function(d) { return d});



	