var width = 960;
var height = 600;

var urls = [
  "https://d3js.org/us-10m.v1.json",
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
];

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// construct a new d3 map
// https://github.com/d3/d3-collection/blob/master/README.md#maps
//var education = d3.map();

// create a new geographic path generator
var path = d3.geoPath();

// create a quantitative linear scale
var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

// create a color threshold scale
var color = d3.scaleThreshold()
    .domain(d3.range(2,74, 9))
    .range(d3.schemeBlues[9]);

// append a group elelment for the scale
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

// add 9 rectangles to the g element for the scale
g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  // .enter().append("rect")
  //   .attr("height", 8)
  //   .attr("x", function(d,i) { return x(i); })
  //   //.attr("width", function(d) { return x(d[1]) - x(d[0]); })
  //   .attr("width", 30)
  //   .attr("fill", function(d) { return color(d[0]); });
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d,i) { return x(i); })
    .attr("width", 30)
    //.attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Bachelors Or Higher");


g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    
  .select(".domain")
    .remove();

// d3.queue()
//     .defer(d3.json, "https://d3js.org/us-10m.v1.json")
//     .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json", function(d) { unemployment.set(d.id, +d.rate); })
//     .await(ready);



//create a D3 queue for our async tasks
var queue = d3.queue();

// read in world.topojson and
// read in meteorites landing coordinates
urls.map(function(url){
  queue.defer(d3.json, url); // add our async tasks from urls array
});

// call the awaitAll method to start processing the tasks on the queue
//once all tasks complete the datasets stored in the jsonDataSets array
queue.awaitAll(function(error,jsonDataSets) {
  //if (error) throw error;

    var us = jsonDataSets[0];
    var education = jsonDataSets[1];


    //create a color threshold scale
    // var mapColor = d3.scaleLinear()
    //     //.domain(d3.range(d3.min(education.map(x => x["bachelorsOrHigher"])), d3.max(education.map(x => x["bachelorsOrHigher"]))))
    //     .domain([d3.min(education.map(x => x["bachelorsOrHigher"])), d3.max(education.map(x => x["bachelorsOrHigher"]))])
    //     .range(d3.schemeBlues[9]);

    //create a color threshold scale
    var mapColor = d3.scaleLinear()
        .domain(d3.range(2,74, 9))
        .range(d3.schemeBlues[9]);

    console.log(d3.range(2, 10))

// function ready(error, us) {
//   if (error) throw error;

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      //.attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
      .attr("fill", function(d) {
        //console.log( education.filter(a => a["fips"] == d.id)[0]["bachelorsOrHigher"])



        // var percentage = education.filter(a => a["fips"] == d.id)[0]["bachelorsOrHigher"];
        // var name = education.filter(a => a["fips"] == d.id)[0]["area_name"];
        // var state = education.filter(a => a["fips"] == d.id)[0]["state"];
        // d.rate = percentage;
        // d.name = name;
        // d.state = state;


        var match = education.filter(a => a["fips"] == d.id)[0];
        d.rate =  match["bachelorsOrHigher"];
        d.name = match["area_name"];
        d.state = match["state"];

         return mapColor(d.rate);
       })
      .attr("d", path)
    .append("title")
      .text(function(d) { return d.name + " "  + d.state + " " + d.rate + "%" });

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
})
