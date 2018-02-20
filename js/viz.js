var svg, oData, nodes, margin,width,height, x,y;

function load(){
  loadData();

  // set svg object
  margin = {top: 40, right: 40, bottom: 50, left: 40},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;


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
    // data.forEach(function (d){
    //   d.MedalRank = +d.MedalRank;
    // });

    //ES6 -FAT ARROW Function
    data.forEach((d)=>{
      d.MedalRank = +d.MedalRank;
    });

    //***************************************************************
    //** draw axis, this is one off task
    //** check whether this is the best place to put this code
    //***************************************************************

    // Get unique years
    var years = []
    var a = new Set(data.map(item=>{return item.Year}))
    a.forEach(item=>{years.push(item)});

    // Get unique ages
    var ages = []
    a = new Set(data.map(item=>{return item.Age}))
    a.forEach(item=>{ages.push(item)});

    x = d3.scaleBand().rangeRound([0, width]);
    y = d3.scaleBand().rangeRound([height, 0]);

    x.domain(years);
    // y.domain(ages.sort(function (a,b){return b-a}));
    //ES 6 from the above we can write it like this:
    y.domain(ages.sort((a,b)=>{return b-a}));


    g.append("g")
      .call(d3.axisTop(x))

    g.append("g")
      .call(d3.axisLeft(y));


    g.append("g")
        .attr("id","grid")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let nested_data = d3.nest()
      .key((d) => d.Age)
      .key((d) => d.Year)
      .key((d) => d.Gender)
      .rollup((v) => v.length)
      .entries(data.filter(d => d.Gender == "Men" | d.Gender == "Women"))


      // function to get values out
      get_value = (arr, gender) => {
      try {
        return arr.filter(d => d.key == gender)[0].value || 0
      } catch(e) {
        return 0
        }
      }

      let final_data = []

      nested_data.forEach((age) => {
          age.values.forEach((year) => {
            final_data.push({Age: age.key,
              Year: year.key,
              Men: get_value(year.values, "Men"),
              Women: get_value(year.values, "Women")})
            })
      })

    oData = final_data;

    // Initial chart when load page
    update('Men')

  })
}


function update(gender){

  var t = d3.transition()
      .duration(750);

  var radius = d3.scaleLinear()
      .domain([0, 75])
      .range([0, 50]);

  var circles = svg.select('#grid')
        .selectAll('circle')
        .data(oData)

  //********* NO NEED TO EXIT BECAUSE THERE WILL BE THE SAME # OF DOM ELEMENTS*************//

  // circles
  //   .exit()
  //   .transition(t)
  //   .attr('r',0)
  //   .style('opacity',0)
  //   .remove();

  //******** UPDATE ELEMENTS ************//
  circles
    .attr("class", gender)
    .attr('r',0)
    // .attr('cx', function(d){return x(d.Year)})
    // .attr('cy', function(d){return y(d.Age)})
    .attr('cx', (d)=>{return x(d.Year)})
    .attr('cy', (d)=>{return y(d.Age)})
    .transition(t)
    .ease(d3.easeBounce)
    // .attr('r',function(d){
    //     if (gender==='Men'){
    //       return radius(d.Men)
    //     }else{
    //       return radius(d.Women)
    //     }
    // })
    .attr('r',(d)=>{
        if (gender==='Men'){
          return radius(d.Men)
        }else{
          return radius(d.Women)
        }
    })
    .style('opacity',.8)


  //******** ENTER ELEMENTS ************//
  circles
    .enter()
    .append('circle')
    .attr("class", gender)
    .attr('r',0)
    // .attr('cx', function(d){return x(d.Year)})
    // .attr('cy', function(d){return y(d.Age)})
    .attr('cx', (d)=>{return x(d.Year)})
    .attr('cy', (d)=>{return y(d.Age)})
    .transition(t)
    .ease(d3.easeBounce)
    // .attr('r',function(d){
    //     if (gender==='Men'){
    //       return radius(d.Men)
    //     }else{
    //       return radius(d.Women)
    //     }
    // })
    .attr('r',(d)=>{
        if (gender==='Men'){
          return radius(d.Men)
        }else{
          return radius(d.Women)
        }
    })
    .style('opacity',.8)


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
