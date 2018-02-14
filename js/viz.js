// initialize the scrollama
var scroller = scrollama();

// variables required for scrollama
var container = null;
var graphic = null;
var chart = null;
var text = null;
var step = null;




var svg, oData, nodes, margin,width,height;
var numNodes = 100;




function load(){
  // ************************
  // Set scroll elements
  // *************************
   container = d3.select('#scroll');
   graphic = container.select('.scroll__graphic');
   chart = graphic.select('.viz');
   text = container.select('.scroll__text');
   step = text.selectAll('.step');
  // console.log(container);



  loadData();
  init();


  margin = {top: 20, right: 20, bottom: 50, left: 20},
  width = d3.select(".viz").node().getBoundingClientRect().width - margin.left - margin.right,
  height = d3.select(".viz").node().getBoundingClientRect().height - margin.top - margin.bottom;
  
  svg = d3.select(".viz")
    .append("svg")
    .attr("width", function(d){
        return d3.select(".viz").node().getBoundingClientRect().width
    })
    .attr("height", function(d){
        return d3.select(".viz").node().getBoundingClientRect().height
    });



}


// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepHeight = Math.floor(window.innerHeight * 0.75);
  step.style('height', stepHeight + 'px');

  // 2. update width/height of graphic element
  var bodyWidth = d3.select('body').node().offsetWidth;
  var textWidth = text.node().offsetWidth;

  var graphicWidth = bodyWidth - textWidth;

  graphic
    .style('width', graphicWidth + 'px')
    .style('height', window.innerHeight + 'px');

  var chartMargin = 20;
  var chartWidth = graphic.node().offsetWidth - chartMargin;

  chart
    .style('width', chartWidth + 'px')
    .style('height', Math.floor(window.innerHeight / 2) + 'px');

      // .attr("width", width + margin.right + margin.left)
      // .attr("height", height + margin.top + margin.bottom)


  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  //ACA PASA TODA LA MAGIA, ACA DEBO DE HACER EL UPDATE DEL CHART
  // response = { element, direction, index }
  console.log('entra: ' + response.index);
  var stepNumber = response.index + 1
  // add color to current step only
  step.classed('is-active', function (d, i) {
    return i === response.index;

  })

  //DRAW & DELETE CHART DEPENDING ON THE STEP
  switch (stepNumber) {
    case 2:
        filterYear(1947);
        break;
    case 3:
        drawChart();
        break;

    // default:
    //   chart.select('p').text(response.index + 1)

  }


  // update graphic based on step

}

function handleStepExit(response){
  console.log('sale: ' + response.index)

  clearSVG();
}

function handleContainerEnter(response) {
  // console.log(response);
  // response = { direction }
}

function handleContainerExit(response) {
  // response = { direction }
}

function setupStickyfill() {
  console.log('entra sticky');
  d3.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.setup({
    container: '#scroll',
    graphic: '.scroll__graphic',
    text: '.scroll__text',
    step: '.scroll__text .step',
    offset: .5,
    debug: false,
  })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
    .onContainerEnter(handleContainerEnter)
    .onContainerExit(handleContainerExit);

  // setup resize event
  window.addEventListener('resize', handleResize);
}


function loadData(){

  d3.csv("./data/MLB.csv",function(data){

    // Cast Data
    data.forEach(function (d){
      d.Year = new Date(d.Year);
      d.Players = Math.round(+d.Players * 10000,0);
    });

    oData = data

    // filterYear(1947);

  })
}



function filterYear(year){
  document.getElementById('year').innerText = year;
  filterData(+year);

}


function filterData(nYear){


  oYearData = oData.filter(item=>{
    return item.Year.getFullYear() === nYear
  })

  // For each year, I create 100 dots, representing 100% of playes
  // then i create n categories according to the stats for each Ethnicity
  var x = []

  oYearData.forEach(item=>{
    var data = []
    data.push(d3.range(item.Players).map(function(d){
      return {Ethnicity: item.Ethnicity}
    }))
    x = x.concat(data[0].slice());


    // UPDATE LABELS WITH STATS FOR YEAR SELECTED
    var txt = '#' + item.Ethnicity.replace(' ','')
    d3.selectAll(txt).text(item.Ethnicity + ': ' + item.Players + ' %' )

  });



  update(x)

}

function update(data){

    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xCenter = [
      {'Ethnicity': 'White', 'center': 100}
      ,{'Ethnicity': 'African American','center': 200}
      ,{'Ethnicity': 'Latino', 'center': 300}
      ,{'Ethnicity': 'Asian', 'center': 400}
    ];

    var colorScale = [
      {'Ethnicity': 'White', 'color': '#B22650'}
      ,{'Ethnicity': 'African American','color': '#53B8BD'}
      ,{'Ethnicity': 'Latino', 'color': '#D4D85F'}
      ,{'Ethnicity': 'Asian', 'color': '#F2B356'}
    ];


    var simulation  = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-10).distanceMax(90))
      .force('center',d3.forceCenter(width/2,height/2))
      .force('x', d3.forceX().x(function(d) {
        var position = xCenter.find(pos=>{return pos.Ethnicity===d.Ethnicity})
        return position.center;
      }));



    var ticked = function() {

      var items = svg.select('g')
        .selectAll('circle')
        .data(data)



      items.enter()
        .append('circle')
        .attr('r',10)
        .merge(items)

      items.exit().remove();

      items

          .attr('cx',function(d){ return d.x })
          .attr('cy',function(d){ return d.y })
          .style('fill',function(d){
             var color = colorScale.find(colors=>{return colors.Ethnicity===d.Ethnicity})
             return color.color;
          })
          .style('opacity',.7);
      }

   simulation
       .nodes(data)
       .on("tick", ticked)
       .alpha(.8);

}



function drawChart(){

  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0,width]);
  var y = d3.scaleLinear().range([height,0]);

  x.domain(d3.extent(oData,function(d){return d.Year}))
  y.domain([0,d3.max(oData,function (d){ return d.Players})])

  var whiteTrend = oData.filter(item=>{
    return item.Ethnicity ==='White'
  });

  var AmericanTrend = oData.filter(item=>{
    return item.Ethnicity ==='African American'
  });

  var LatinoTrend = oData.filter(item=>{
    return item.Ethnicity ==='Latino'
  });

  var AsianTrend = oData.filter(item=>{
    return item.Ethnicity ==='Asian'
  });

  var whiteLine = d3.line(whiteTrend)
    .x(function (d){return x(d.Year)})
    .y(function (d){return y(d.Players)})

    var AmericanLine = d3.line(AmericanTrend)
      .x(function (d){return x(d.Year)})
      .y(function (d){return y(d.Players)})

  // var items = svg.select('g')
  var lineWhite = g.selectAll('.line')
    .data([whiteTrend])

  var lineAmerican = g.selectAll('.line')
    .data([AmericanTrend])

  lineWhite.enter()
    .append('path')
    .merge(lineWhite)
    .attr('class','line')
    .attr('d',whiteLine)

  lineWhite.exit().remove();

  // lineAmerican.enter()
  //   .append('path')
  //   .merge(lineAmerican)
  //   .attr('class','line')
  //   .attr('d',AmericanLine)
  //
  // lineAmerican.exit().remove();

  g.selectAll('.line')
    .call(transition);

  g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));

   // Add the Y Axis
   g.append("g")
       .call(d3.axisLeft(y));

   function transition(path) {
         path.transition()
             .duration(2000)
             .attrTween("stroke-dasharray", tweenDash);
     }
     function tweenDash() {
         var l = this.getTotalLength(),
             i = d3.interpolateString("0," + l, l + "," + l);
         return function (t) { return i(t); };
     }

}


function clearSVG(){
  svg.selectAll('*').transition().style('opacity',0).duration(1000).remove();

}
