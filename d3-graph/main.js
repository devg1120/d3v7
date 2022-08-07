import * as d3 from "d3";
//import * as d3 from "d3v4";


import './style.css'

// SVG要素の選択とサイズの取得
var svg = d3.select("svg"),
    margin = {top: 60, right: 30, bottom: 40, left: 40},
    width = svg.attr("width"),
    height = svg.attr("height"),
    cWidth = width - margin.left - margin.right,
    cHeight = height - margin.top - margin.bottom;

var formatTime = d3.timeFormat("%m/%d");
var formatClass = d3.timeFormat("date-%m%d");
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// マウスカーソルからのフォーカスの位置推定
var parseTime = d3.timeParse("%Y/%m/%e");
var bisectDate = d3.bisector(function(d) { return d.day; }).left;

var x = d3.scaleBand().rangeRound([0, cWidth]).padding(0.2);
var y = d3.scaleLinear().range([cHeight, 0]);

d3.json("data.json").then(
  function(data) {

    data.forEach(function(d) {
      d.day = parseTime(d.day);
      d.value = +d.value;
    });

    x.domain(data.map(function(d) { return d.day; }));
    y.domain([d3.min(data, function(d) { return d.value; }) / 1.005, d3.max(data, function(d) { return d.value; }) * 1.005]);

    // scaleBand invert
    x.invert = (function(){
        // rangeがpaddingによってズレてしまうので補正
        var tooltip_range =
          [x.range()[0] + x.bandwidth() * x.padding() ,
           x.range()[1] - x.bandwidth() * x.padding() ]
        var scale = d3.scaleQuantize().domain(tooltip_range).range(x.domain())
        return function(x){
            return scale(x)
        }
    })()

    // x軸（横）の目盛り
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + cHeight + ")")
        .call(
          d3.axisBottom(x)
          .ticks(12)
          .tickFormat(d3.timeFormat("%Y/%m/%d"))
        );
    // 横の目盛りを日付のみにして土日にクラスを付与する
    var ticks = d3.selectAll(".axis--x text");
    ticks.attr("class", function(d){
      if(d3.timeFormat("%a")(d) == "Sat") return "sat";
      if(d3.timeFormat("%a")(d) == "Sun") return "sun";
      return "weekday";
    }).html(function(d) {return formatTime(d);});

    // y軸（縦）の目盛り
    g.append("g")
        .attr("class", "axis axis--y")
        .call(
          d3.axisLeft(y)
          .ticks(6)
          .tickSizeInner(-cWidth)
          .tickFormat(function(d) { return d/1000 + "k"; }))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("アクセス量");

    // focus要素の追加
    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", cHeight);

    // 棒グラフを描画
    g.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
          return x(d.day);
        })
        .attr("y", function(d) {
          return y(d.value);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return cHeight - y(d.value); })
        .attr("fill", "steelblue");

    // focusの判定用のoverlayを追加
    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", cWidth)
        .attr("height", cHeight)
        .on("mouseover", function() {
          tooltip.style("display", "block");
          focus.style("display", "block"); })
        .on("mouseout", function() {
          // tooltipとfocusを非表示
          tooltip.style("display", "none");
          focus.style("display", "none");
          // 棒グラフのfocus（一旦focusクラスを全て外す）
          g.selectAll(".bar").attr("class",function(d) {
            return "bar " + formatClass(d.day);
          })
         })
        .on("mousemove", mousemove);

    // tooltip と focusの設定
    var tooltip = d3.select("#contents").append("div").attr("class", "tooltip"),
        tt_date = tooltip.append("time").attr("class", "tt_date"),
        tt_value = tooltip.append("div").attr("class", "tt_value");
    function mousemove() {
      //var x0 = x.invert(d3.mouse(this)[0]),
      var x0 = x.invert(d3.pointer(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.day > d1.day - x0 ? d1 : d0;

      tt_date.html(function() {return formatTime(d.day);});
      tt_value.html(function() {return "アクセス数："+d.value});

      // マウスの位置によりtooltipを表示位置を変更（右側 or 左側）
      var centerX = cWidth / 2;
      var tooltipPosX = 5,
          tooltipPosY = -15;
      //if(d3.mouse(this)[0] > centerX) {
      if(d3.pointer(this)[0] > centerX) {
        // tooltipの大きさ分、左側にx座標をずらす
        tooltipPosX = -tooltip.node().getBoundingClientRect().width;
      }
      tooltip.transition()
            .duration(200)
            .ease(d3.easeLinear)
            .style("left", (d3.event.pageX + tooltipPosX) + "px")
            .style("top", (d3.event.pageY - tooltipPosY) + "px");
      focus.attr("transform", "translate(" + parseInt(x(d.day) + x.bandwidth()/2) + "," + 0 + ")");
      focus.select(".x-hover-line").attr("y2", cHeight - margin.top);

      // 棒グラフのfocus（一旦focusクラスを全て外す）
      g.selectAll(".bar").attr("class",function(d) {
        return "bar " + formatClass(d.day);
      })
      // 棒グラフのfocus（選択したものにfocusクラスをあてる）
      g.select("."+formatClass(d.day)).attr("class",function(d) {
        return "bar " + formatClass(d.day) + " focus";
      })
    }
});

