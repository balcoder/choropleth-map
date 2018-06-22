
// urls for the data
var urls = [
  "https://d3js.org/us-10m.v1.json",
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
];

// main svg
var svg = d3.select("svg")
    .attr("width",960)
    .attr("height",600);

// create a new geographic path generator
var path = d3.geoPath();

// color threshold scale for legend
var colorLegend = d3.scaleThreshold()
    .domain([10,20,30,40,50,60,70,80])
    .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);

// Linear scale for legend with position encoding for the key only.
var xLegend = d3.scaleLinear()
    .domain([0, 90])
    .range([0, 240]);
console.log(xLegend(1));
console.log(colorLegend.range().map(function(d, i) {
      return {
        x0: i ? xLegend(colorLegend.domain()[i - 1]) : xLegend.range()[0],
        x1: i < colorLegend.domain().length ? xLegend(colorLegend.domain()[i]) : xLegend.range()[1],
        z: d
      };
    }));


// axis for legend
var xAxis = d3.axisBottom()
    .scale(xLegend)
    .tickSize(13)
    .tickFormat(function(x) { return x + "%"; })
    .tickValues(colorLegend.domain());

// a group for the legend
var g = svg.append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(600,40)");

// add rectangles to the legend
g.selectAll("rect")
// data will be an obj like
// [{x0:0, x1:26.66666, z:#f7fbff}, {x0:26.66666, x1:53.33333, z:#deebf7},.....]
    .data(colorLegend.range().map(function(d, i) {
      return {
        x0: i ? xLegend(colorLegend.domain()[i - 1]) : xLegend.range()[0],
        x1: i < colorLegend.domain().length ? xLegend(colorLegend.domain()[i]) : xLegend.range()[1],
        z: d
      };
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return d.x0; })
     // first width will be 26.66 - 0
     // next will be 53.3333 - 26.666 and so on.
    .attr("width", function(d) { return d.x1 - d.x0; })
    .style("fill", function(d) { return d.z; });

g.append("text")
    .attr("class", "caption")
    .attr("x", xLegend.range()[0])
    .attr("y", -10)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population with Bachelors Or Higher");

// call the axis
g.call(xAxis)

//create a D3 queue for our async tasks
var queue = d3.queue();

// loop through urls array and read in usa topojson and education data
urls.map(function(url){
  queue.defer(d3.json, url); // add our async tasks from urls array
});

// call the awaitAll method to start processing the tasks on the queue
//once all tasks complete the datasets stored in the jsonDataSets array
queue.awaitAll(function(error,jsonDataSets) {
  if (error) throw error;

    var us = jsonDataSets[0];
    var education = jsonDataSets[1];

    //create a new color linear scale for our map
    var mapColor = d3.scaleLinear()
        .domain(d3.range(2,74, 9))
        .range(d3.schemeBlues[9]);

    // append tooltip div to body
    var div = d3.select("body").append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("class", "county")
    .attr("fill", function(d) {
      // while adding each path color, add rate, name, state,
      //and fips to the data to add as attributes below
      var match = education.filter(a => a["fips"] == d.id)[0];
      d.rate =  match["bachelorsOrHigher"];
      d.name = match["area_name"];
      d.state = match["state"];
      d.fips = match["fips"]
      return mapColor(d.rate);
     })
    .attr("data-fips", function(d) { return d.fips })
    .attr("data-education", function(d) { return d.rate })
    .attr("d", path)
    .on("mouseover", function(d) {
      div.transition()
      .duration(200)
      .style("opacity", .9);
      div.html(d.name + " "  + d.state + "<br/>"  + d.rate + "%")
      .attr("data-education", d.rate)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
      })
    .on("mouseout", function(d) {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    });

  // add in state boundaries
  svg.append("path")
  // topojson.mesh allows for rendering strokes in complicated objects efficiently, as edges       // that are shared by multiple features are only stroked once.
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
})
