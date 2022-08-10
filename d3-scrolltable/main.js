import * as d3 from "d3";


//import './style.scss'
import './style.css'

var keys,
    allData,
    currentData,
    startPos = 0,
    increment = 10;

//var scrollEvent = d3.behavior.zoom()
var scrollEvent = d3.zoom()
                    //.on('zoom', function (e) {
                    //  var scrollDirection = (d3.event.sourceEvent.deltaY > 0) ? 1 : -1;
                    .on('zoom', function (event, d) {
                      var scrollDirection = (event.sourceEvent.deltaY > 0) ? 1 : -1;
                      startPos += (scrollDirection > 0 && startPos + increment < allData.length) ? scrollDirection
                                  : (scrollDirection < 0 && startPos + increment > increment) ? scrollDirection
                                  : 0;
                      updateTable();
                    });

var table = d3.select("#table").append("table"),
    thead = table.append("thead"),
    tbody = table.append("tbody").call(scrollEvent);

//d3.csv("data.csv").then( function( data) {
d3.csv("https://gist.githubusercontent.com/enjalot/1525346/raw/c4603a8d7dedc7e8c8f705ca8252a335b49e03dc/prices.csv").then( function(data) {

  keys     = Object.keys(data[0]),
  allData  = data;

  thead.append('tr')
    .selectAll('th')
    .data(keys).enter()
    .append('th')
    .text(function (d) {
    return d;
  });

  updateTable();
});

function updateTable() {
  // Set new data based on startPos and increment.
  currentData = allData.slice(startPos, startPos + increment);

  // Delete previous rows.
  tbody.selectAll('tr').remove();

  // Create new rows.
  var tr = tbody.selectAll("tr")
                .data(currentData).enter()
                .append("tr")
                .classed("even", function(d, i) {
                  return i % 2 == 1;
                });

      tr.selectAll('td')
        .data(function (d) {
          return keys.map(function (e) {
            return {
              key: e,
              value: d[e]
            }
          });
        }).enter()
        .append('td')
        .text(function (d) {
          return d.value;
        });
}

