var urls = [
  "https://d3js.org/us-10m.v1.json",
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
];
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // create a new geographic path generator
    var path = d3.geoPath();

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

    // [0]["bachelorsOrHigher"]
    var us = jsonDataSets[0];
    var education = jsonDataSets[1];

    // //create a color threshold scale
    // var mapColor = d3.scaleLinear()
    //     .domain([d3.min(education.map(x => x["bachelorsOrHigher"])), d3.max(education.map(x => x["bachelorsOrHigher"]))])
    //     .range(d3.schemeBlues[9]);
    var mapColor = d3.scaleThreshold()
        .domain(d3.range(2, 76))
        .range(d3.schemeBlues[9]);

        svg.append("g")
            .attr("class", "counties")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.counties).features)
          .enter().append("path")
              //.attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
            .attr("fill", function(d) {
              //console.log(education.find(function(a) { return a["fips"]===d.id; }).bachelorsOrHigher)
            var percentage = education.filter(a => a["fips"] == d.id)[0]["bachelorsOrHigher"];
            console.log(percentage);

              //  var percentage = education.filter(function(a) { return a["fips"]===d.id; })["bachelorsOrHigher"];
              //var percentage =  education.find(function(a) { return a["fips"]===d.id; })

              // d.rate = percentage;
              //
              //  return mapColor(d.rate);
             })
            .attr("d", path)
          .append("title")
            .text(function(d) { return d.rate + "%"; });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

    console.log(mapColor(70));

    console.log(education.find(function(a) { return a["fips"]===1007; }).bachelorsOrHigher);
    console.log(d3.max(education.map(x => x["bachelorsOrHigher"])));
    console.log(d3.min(education.map(x => x["bachelorsOrHigher"])));


});
