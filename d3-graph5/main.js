import * as d3 from "d3";

import './style.css'

			// Data set
			var stations = [
				{'name': 'A', 'xy': [1, 1]},
				{'name': 'B', 'xy': [2, 2]},
				{'name': 'C', 'xy': [3, 3]},
				{'name': 'D', 'xy': [2, 1.5]},
				{'name': 'E', 'xy': [2.5, 1.5]},
				{'name': 'F', 'xy': [3, 1.5]}
			];

			var railroads = [
				[[1, 1], [2, 2], [3, 3]],
				[[2, 2], [2, 1.5], [2.5, 1.5], [3, 1.5]]
			];

			var svg = d3.select("body").select("svg");			
			
			// Scaling function
			var width = 640;
			var height = 480;
			
			var xScale = d3.scaleLinear()
				.domain([0, 4])	 // Based on data set: [d3.min(stations, function(d) { return d["xy"][0]; }), d3.max(stations, function(d) { return d["xy"][0]; })]
				.range([0, width]);

			var yScale = d3.scaleLinear()
				.domain([0, 4])
				.range([0, height]);

			// Draw railroads
			for (var i = 0; i < railroads.length; i++) {
				svg.append("path")
					.datum(railroads[i])
					.attr("fill", "none")
					.attr("stroke", "steelblue")
					.attr("stroke-width", 3)
					.attr("d", d3.line()
						.x(function(d) { return xScale(d[0]); })
						.y(function(d) { return yScale(d[1]); }));
			}

			// Draw stations
			var tooltip = d3.select("body").append("div").attr("class", "tooltip");
			var stations_svg = svg.selectAll("circle")
				.data(stations)
				.enter()
				.append("circle")
				.attr("cx", function(d) { return xScale(d['xy'][0]); })
				.attr("cy", function(d) { return yScale(d['xy'][1]); })
				.attr("r", 4)
				.on("mouseover", function(elem, data) {
					tooltip
						.style("visibility", "visible")
						.html("Station: " + data['name']);
				})
				.on("mousemove", function(elem, data) {
					tooltip
						.style("top", (event.pageY - 20) + "px")
						.style("left", (event.pageX + 10) + "px");
				})
				.on("mouseout", function(d) {
					tooltip.style("visibility", "hidden");
				})

			// Draw station names
			svg.selectAll("text")
				.data(stations)
				.enter()
				.append("text")
				.attr("x", function(d) { return xScale(d['xy'][0] + 0.05); })
				.attr("y", function(d) { return yScale(d['xy'][1] - 0.05); })
				.attr("fill", "black")
				.attr("font-size", "12px")
				.text(function(d) { return d["name"]; });

			// Set zoom function
			var zoom = d3.zoom()
				.scaleExtent([0.25, 10])
				.on('zoom', function(event) {
					svg.selectAll('circle').attr('transform', event.transform);
					svg.selectAll('text').attr('transform', event.transform);
					svg.selectAll('path').attr('transform', event.transform);
				});

			svg.call(zoom);

