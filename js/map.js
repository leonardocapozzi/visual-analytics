var width = 500,
height = 680;

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
		.on( "mouseover", showTooltipBorough)
		.on( "mouseout", hideTooltipBorough)
		.on( "mousemove", moveTooltipBorough)
		//.on("click", selectBorough)
		.style("opacity", 0.5)
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);	

});
/*
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
	
}*/

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

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

/*-------------------------------------------SLIDER---------------------------------------*/

var leafletCont= d3.select('#mapId').append('div').attr('class', 'leaflet-control-container')
                                    .append('div').attr('class','leaflet-top leaflet-left').style("margin-top",	"40px")
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

/*---------------------------------LEGEND-------------------------------------------*/


const colorScale = d3.scaleLinear()
    .domain([1.0, 2.0, 3.0, 4.0]) //value for the legend
    .range(['#fecc5c','#fd8d3c','#f03b20','#bd0026']);	
	
const base_legend = d3.select("body").selectAll('svg')
	.append("rect")
	.attr('id',"recLegendMap")
	.attr("x",15)
	.attr("y",130) 
	.attr("width", 120 )
	.attr("height", 140 )
	.attr("rx","12")
	.attr("class", "baseLegend")
	.style('stroke','')
	.style('position', 'fixed')
	
	
const label1 = d3.select("svg").append('g')
	.append("text")
	.text("SEVERITY")
	.attr("x", 35)
	.attr("y", 152) 
	.style('position', 'fixed')

const label2 = d3.select("svg").append('g')
	.append("text")
	.text("GRADE")
	.attr("x", 45)
	.attr("y", 168) 
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
	.attr("x", 30)
	.attr("y", 178) 
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale)
	.on("click", selectSeverity)
	//.attr("stroke", "black") //per iniziare con colori già selezionati
	//.attr("stroke-width", 2)
	//.attr("selected",true);
	
legend.append("text")
    .attr("x", 60)
    .attr("y", 188)
    .attr("dy", ".35em")
    .text(function(d) { return d});

const higher = d3.select("svg").append('g').append("text")
    .attr("x", 80)
    .attr("y", 188)
    .attr("dy", ".35em")
    .text("higher");	

const lower = d3.select("svg").append('g').append("text")
    .attr("x", 80)
    .attr("y", 248)
    .attr("dy", ".35em")
    .text("lower");	

const line = d3.select("svg")
	.append("line")
	.attr("x1", 98)
	.attr("y1", 200)
	.attr("x2", 98)
	.attr("y2", 242)
	.style('stroke','black')
    .style('stroke-width',2)

const row_left = d3.select("svg")
	.append("line")
	.attr("x1", 98)
	.attr("y1", 200.5)
	.attr("x2", 90)
	.attr("y2", 214)
	.style('stroke','black')
    .style('stroke-width',2)
	
const row_right = d3.select("svg")
	.append("line")
	.attr("x1", 98)
	.attr("y1", 200.5)
	.attr("x2", 106)
	.attr("y2", 214)
	.style('stroke','black')
    .style('stroke-width',2)	

/*----------------------------------BUBBLE----------------------------------------*/

var checkbox_day = document.getElementById("day");
var checkbox_night = document.getElementById("night");
var checkbox_2016 = document.getElementById("2016");
var checkbox_2017 = document.getElementById("2017");
var checkbox_2018 = document.getElementById("2018");
var checkbox_2019 = document.getElementById("2019");
var checkbox_2020 = document.getElementById("2020");
var checkbox_all = document.getElementById("allYears");

var data = DataSetFactory.getInstance().data;
console.log("data", data)

//Create a tooltip, hidden at the start
var tooltip = d3.select("#mapId")
	.append("div")
	.attr("class","tooltip");

//Create a tooltip, hidden at the start
function showTooltip(d) {
	tooltip.style("display","block")
	.html("<b>Id:</b> " + d[2] + "<br>" + "<b>Street:</b> " + d[6] + "<br>" + 
	"<b>Severity:</b> " + d[5] + "<br>" + "<b>Year:</b> " + d[4] +  "<br>" + "<b>D/N:</b> " + d[3] + "<br>" + 
	"<b>Zipcode:</b> " + d[7]  + "<br>" + "<b>Duration:</b> " + d[8] + "<br>" + "<b>Season:</b> " + d[9]);
	d3.select(this).attr("stroke", "white")
	.attr("stroke-width", 0.2)
}

//Move the tooltip to track the mouse
function moveTooltip() {
	tooltip.style("top",(d3.event.pageY + tooltipOffset.y) + "px")
		.style("left",(d3.event.pageX + tooltipOffset.x) + "px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
	tooltip.style("display","none");
	d3.select(this).attr("stroke", "black")
	.attr("stroke-width", 0.1)
}

var selectedBubble = [];

//color the selected bubble
function selectBubble(d){
	if (d3.select(this).attr("selected") === "true"){
		d3.select(this)
		.style("fill", function(d){ if (d[5] == 1.0) return '#fecc5c'; else if(d[5] == 2.0) return '#fd8d3c'; 
		else if(d[5] == 3.0) return '#f03b20'; else return '#bd0026';})
		.style("opacity", 0.5)
		.attr("stroke", "black")
		.attr("stroke-width", 0.1)
			.attr("selected",false)
			if(selectedBubble.includes(d[2])){
				selectedBubble = selectedBubble.filter(b => b !== d[2])
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
			selectedBubble.push(d[2]);
			console.log(d3.select(this).attr("selected"), selectedBubble)		
	}
	
}

var accidents_list = []
for(var i in data){
	var long = data[i].Start_Lng; //0
	var lat = data[i].Start_Lat; //1
	var id = data[i].ID; //2
	var ss = data[i].Sunrise_Sunset; //3

	date = new Date(data[i].Start_Time)
	var year = date.getFullYear().toString(); //4
	
	var severity = data[i].Severity; //5
	var street = data[i].Street; //6
	var zipcode = data[i].Zipcode; //7

	time1 = date.getTime()
	date2 = new Date(data[i].End_Time)
	time2 = date2.getTime()
	var diff = msToTime(time2-time1) //8
	var month = date2.getMonth()
	var day = date2.getDay()
	var season = computeSeason(day, month); //9

	var info_accident = [long, lat, id, ss, year, severity, street, zipcode, diff, season]
	accidents_list.push(info_accident)
}	
console.log("accident list", accidents_list)

function drawCircles(marker){
	d3.select("g") 
	.selectAll("circle")
	.data(marker).enter()
	.append("circle")
	.attr("cx", function (d) { return projection(d)[0]; })
	.attr("cy", function (d) { return projection(d)[1]; })
	.attr("r", 2)
	.style("fill", function(d){ if (d[5] == 1.0) return '#fecc5c'; else if(d[5] == 2.0) return '#fd8d3c';
	else if(d[5] == 3.0) return '#f03b20'; else return '#bd0026';})
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

function removeCircles(removeMarker){
	d3.select("g") 
	.selectAll("circle")
	.data(removeMarker).remove()
	console.log("rem", removeMarker)
	removeMarker.length = 0
	console.log("rem le", removeMarker)
}

var accident_day = []
var accident_night = []
var accident_2016 = []
var accident_2017 = []
var accident_2018 = []
var accident_2019 = []
var accident_2020 = []
var accident_all = []

function showDayDetails(){
	if(checkbox_day.checked == true){
		accident_day = accidents_list.filter(d => d[3] === 'Day')
		console.log("day", accident_day)
		drawCircles(accident_day)	
	}
	else removeCircles(accident_day)			
}

function showNightDetails(){
	if(checkbox_night.checked == true){
		accident_night = accidents_list.filter(d => d[3] === 'Night')
		console.log("night", accident_night)
		drawCircles(accident_night)
	}
	else removeCircles(accident_night)
}

function show2016Details(){
	if(checkbox_2016.checked == true){
		accident_2016 = accidents_list.filter(d => d[4] === '2016')
		console.log("2016", accident_2016)
		drawCircles(accident_2016)
	}
	else removeCircles(accident_2016)
		
}

function show2017Details(){
	if(checkbox_2017.checked == true){
		accident_2017 = accidents_list.filter(d => d[4] === '2017')
		console.log("2017", accident_2017)
		drawCircles(accident_2017)
	}
	else removeCircles(accident_2017)
}

function show2018Details(){
	if(checkbox_2018.checked == true){
		accident_2018 = accidents_list.filter(d => d[4] === '2018')
		console.log("2018", accident_2018)
		drawCircles(accident_2018)
	}
	else removeCircles(accident_2018)	
}

function show2019Details(){
	if(checkbox_2019.checked == true){
		accident_2019 = accidents_list.filter(d => d[4] === '2019')
		console.log("2019", accident_2019)
		drawCircles(accident_2019)
	}
	else removeCircles(accident_2019)	
}

function show2020Details(){
	if(checkbox_2020.checked == true){
		accident_2020 = accidents_list.filter(d => d[4] === '2020')
		console.log("2020", accident_2020)
		drawCircles(accident_2020)
	}
	else removeCircles(accident_2020)
}

function showAllYearsDetails(){
	if(checkbox_all.checked == true){
		accident_all = [].concat(accidents_list)
		console.log("all", accident_all)
		drawCircles(accident_all)
	}
	else removeCircles(accident_all)
}

var accident_severity_1 =  []
var accident_severity_2 =  []
var accident_severity_3 =  []
var accident_severity_4 =  []

function selectSeverity(d){
	if (d3.select(this).attr("selected") === "true"){
		d3.select(this).attr("stroke", "none")
		.attr("selected",false)
		if(d == 1) removeCircles(accident_severity_1)
		if(d == 2) removeCircles(accident_severity_2)
		if(d == 3) removeCircles(accident_severity_3)
		if(d == 4) removeCircles(accident_severity_4)	
	}
	else{
		d3.select(this).attr("stroke", "black")
		.attr("stroke-width", 2)
		.attr("selected",true)
		if(d == 1){
			accident_severity_1 = accidents_list.filter(a => a[5] === "" + d + ".0")
			console.log("acc sev ", accident_severity_1)
			drawCircles(accident_severity_1)
		}
		if(d == 2){
			accident_severity_2 = accidents_list.filter(a => a[5] === "" + d + ".0")
			console.log("acc sev ", accident_severity_2)
			drawCircles(accident_severity_2)
		}
		if(d == 3){
			accident_severity_3 = accidents_list.filter(a => a[5] === "" + d + ".0")
			console.log("acc sev ", accident_severity_3)
			drawCircles(accident_severity_3)
		}
		if(d == 4){
			accident_severity_4 = accidents_list.filter(a => a[5] === "" + d + ".0")
			console.log("acc sev ", accident_severity_4)
			drawCircles(accident_severity_4)
		}
		
	}
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

function computeSeason(day, month){
	if(month == 3 && day >=21 || month == 4 || month == 5 || month == 6 && day <= 21 ) return "Spring";
	else if(month == 6 && day >=22 || month == 7 || month == 8 || month == 9 && day <= 22 ) return "Summer";
	else if(month == 9 && day >=23 || month == 10 || month == 11 || month == 12 && day <= 21 ) return "Autumn";
	else return "Winter";
}