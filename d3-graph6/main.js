import * as d3 from "d3";

import './style.css'


var dataset = [
  { "name": "SARS", "time": 2002, "period": 2003, "Type": "Coronavirus / Bats Civets", "Death toll": "770"},
  { "name": "Ebola", "time": 2014, "period": 2016, "Type": "Ebolavirus / Wild animals", "Death toll": "11,000"},
  { "name": "MERS", "time": 2015, "period": "Present", "Type": "Coronavirus / Bats, camels", "Death toll": "850"},
  { "name": "COVID-19", "time": 2019, "period": "Present", "Type": "Coronavirus – Unknown (possibly pangolins)", "Death toll": "1M(2020.APL)"},
]

//keys() オブジェクトのキーを配列取得
//var names = d3.keys(dataset[0]);
var names = Object.keys(dataset[0]);

var table = d3.select("body")
  .append("table")
  .attr("border", "1")

table.append("thead")
  .append("tr")
  .selectAll("th")
  .data(names)
  .enter()
  .append("th")
  .text(function(d) { return d; });

table.append("tbody")
  .selectAll("tr")
  .data(dataset)
  .enter()
  .append("tr")
  .selectAll("td")
  //.data(function(row) { return d3.entries(row); }) // d3.entries オブジェクトのキーと値を配列取得
  .data(function(row) { return Object.entries(row); }) // d3.entries オブジェクトのキーと値を配列取得
  .enter()
  .append("td")
  //.text(function(d) { return d.value; }); //d.value 値の参照
  .text(function(d) {  return d[1]; }); //d.value 値の参照

