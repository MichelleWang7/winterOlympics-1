var svg, oData, nodes, margin,width,height, x,y;

function load(){
  loadData();

  // set svg object
  margin = {top: 40, right: 40, bottom: 50, left: 40},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;
  // width = d3.select(".viz").node().getBoundingClientRect().width - margin.left - margin.right,
  // height = d3.select(".viz").node().getBoundingClientRect().height - margin.top - margin.bottom;


  svg = d3.select(".viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(responsivefy);

  g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

function loadData(){
  d3.csv("./data/WinerOlympicMedals.csv",function(data){

    // Cast Data
    data.forEach(function (d){
      d.MedalRank = +d.MedalRank;
    });

    oData = data

    //***************************************************************
    //** draw axis, this is one off task
    //** check whether this is the best place to put this code
    //***************************************************************

    // Get unique years
    var years = []
    var a = new Set(oData.map(item=>{return item.Year}))
    a.forEach(item=>{years.push(item)});

    // Get unique ages
    var ages = []
    a = new Set(oData.map(item=>{return item.Age}))
    a.forEach(item=>{ages.push(item)});

    x = d3.scaleBand().rangeRound([0, width]);
    y = d3.scaleBand().rangeRound([height, 0]);

    x.domain(years);
    y.domain(ages.sort(function (a,b){return b-a}));

    g.append("g")
      .call(d3.axisTop(x))

    g.append("g")
      .call(d3.axisLeft(y));

    // Initial chart when load page
    filterData('Women');

  })
}

function filterData(gender){

  genderData = oData.filter(item=>{
      return item.Gender === gender;
  });

  bubbleCrossTab(genderData,gender);
}



function bubbleCrossTab(data,gender){

  var medalsByYear = d3.nest()
    .key(function (d){ return d.Age }).sortKeys(d3.descending)
    .key(function (d){ return d.Year })
    .rollup(function (v){ return v.length})
    .entries(data);

  //need to get d3.extent() when grouping by year & gender
  var radius = d3.scaleLinear()
      .domain([0, 75])
      .range([0, 50]);

  var rows = g.selectAll(".row")
      .data(medalsByYear)


  // rows
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("transform", function (d) { return "translate(0," + y(d.key) + ")"; })
      // .merge(rows);

  // rows.exit().remove();


  var cells = rows.selectAll(".cell")
      .data(function (d) { return d.values; })

  // cells
      .enter()
      .append("g")
      .attr("transform", function (d, i) { return "translate(" + i * x.bandwidth() + ",0)"; })
      .attr("class", "cell")
      // .merge(cells);

  // cells.merge(cells).exit().remove();

  var circle = cells.append("circle")
      .attr("class", gender)
      .attr("cx", x.bandwidth())
      .attr("cy", y.bandwidth() )
      .attr('r',0)
      .transition()
      .duration(1500)
      .attr("r", function (d) {
        return d.value === 0 ? 0 : radius(d.value);
      })
      .style('opacity',.6)
}

function cleanSVG(gender){
  svg.selectAll('#' + gender)
    .transition()
    .style('opacity',0)
    .duration(1000);
    // .remove();

}

// function to resize svg dynamicaly
// taken from @alandunning
// http://bl.ocks.org/alandunning/51c76ec99c3ffee2fde6923ac14a4dd4
function responsivefy(svg) {
  var container = d3.select(svg.node().parentNode);
  var width = parseInt(svg.style("width"));
  var height = parseInt(svg.style("height"));
  var aspect = width / height;
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
  d3.select(window).on("resize." + container.attr("id"), resize);
}
