import * as d3 from "d3";


import './style.css'

	const nCircles = 1000, circleSize = 3, sigmaRandom = 40;
	const scaleInitial = 1, nTick = 10, tickPadding = {x: 12, y: 6};

	const canvas = document.querySelector('#canvas');
	const svg = d3.select("#canvas").append('svg');
	const gX = svg.append("g").attr("class", "axis axis--x");
	const gY = svg.append("g").attr("class", "axis axis--y");

	let circles, debug = [];
	let d3Transform, [widthFormer, heightFormer] = [0, 0];

	/*============= main ===============*/
	resetD3Transform(scaleInitial);
	createRenderCircles(randomCircles(nCircles));
	(new ResizeObserver(renderCircles)).observe(canvas, {box: 'content-box'});
	document.getElementById("debug").onclick = resetScale;


	/*============= functions ===============*/
	function resetD3Transform(scale) {
		d3Transform = d3.zoomIdentity.translate(0, 0, scale);
	}

	function resetScale() {
		resetD3Transform(scaleInitial);
		renderCircles();
	}

	function renderCircles() {
		const [width, height] = widthHeightCanvas();

		const xScale = d3.scaleLinear()
			.domain([-width / 2, width / 2])
			.range([0, width]);
		const yScale = d3.scaleLinear()
			.domain([-height / 2, height / 2])
			.range([height, 0]);

		const xAxis = d3.axisBottom(xScale)
			.ticks(nTick)
			.tickSize(height)
			.tickPadding(-tickPadding.x);
		const yAxis = d3.axisRight(yScale)
			.ticks(nTick * height / width)
			.tickSize(width)
			.tickPadding(tickPadding.y - width);

		circles
			.attr("cx", d => xScale(d.x))
			.attr("cy", d => yScale(d.y))
			.style("fill", d => d.color);

		const zoomed = (event, _) => {
			d3Transform = event.transform;
			gX.call(xAxis.scale(d3Transform.rescaleX(xScale)));
			gY.call(yAxis.scale(d3Transform.rescaleY(yScale)));
			svg.selectAll('circle').attr('transform', d3Transform);
			circles.attr("transform", d3Transform).attr("r", circleSize/d3Transform.k);
		}

		const zoom = d3.zoom().on("zoom", zoomed);
		svg.call(zoom).call(zoom.transform, d3Transform);

		function widthHeightCanvas() {
			const {width, height} = canvas.getBoundingClientRect();
			setCenterD3Transform(width, height);
			return [width, height];
		}

		function setCenterD3Transform(width, height) {
			const v = (1/d3Transform.k-1)/2;
			d3Transform = d3Transform.translate((width-widthFormer)*v, (height-heightFormer)*v);
			[widthFormer, heightFormer] = [width, height];
		}
	};

	function createRenderCircles(data) {
		svg.selectAll("circle").remove();
		circles = svg.append("g").selectAll("circle")
			.data(data)
			.enter()
			.append("circle");
		renderCircles();
		debug = [`total = ${data.length.toLocaleString()}`];
		document.getElementById("debug").innerText = debug.join("\n");
	}

	function randomCircles(n) {
		const rng = d3.randomNormal(0, sigmaRandom);
		const randomColor = () => "#" + Math.random().toString(16).slice(-4) + "00";
		return [...Array(n)].map(()=>({x: rng(), y: rng(), color: randomColor()}));
	};

	
	/*============= read files when dropped ===============*/

	d3.select('svg')
		.on('dragover', function(event, _) {
			event.stopPropagation();
			event.preventDefault();
		})
		.on('drop', async function(event, _) {
			event.stopPropagation();
			event.preventDefault();
			const files = Array.from(event.dataTransfer.files);
			const data = await Promise.all(files.map(f => f.text()));
			createRenderCircles(data.map(d3.csvParse).flat());
		});

