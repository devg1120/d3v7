import * as d3 from "d3";


import './style.css'


        class MultipleLines{
            constructor( el ){

                this.d3el = d3.select( el )
                this.el = document.querySelector(el);
            }

            init (){

                this.svg = this.d3el.append("svg");
                this.parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");

                this.dataset = []
                this.times = []
                this.parseTimes = []
                this.margin = {top:20,right:10,bottom:45,left:30}
                this.width
                this.height

                this.xScale
                this.yScale

                this.gridX
                this.gridY

                this.axisx
                this.line
                this.x
                this.y
                this.yMins = []
                this.yMaxs = []

                this.pathGroups
                this.paths = [];
                this.lines = [];
                this.mask

                this.brush
                this.brushGroup
                this.zoomed
                this.zoomHistory = []
                this.nowPosition = 1
                this.zoomTransition = false

                this.labelAfter = 8

            }
            // データをセット
            set data (dataset){
                this.dataset = dataset;
            }
            // データをゲット
            get data (){
                return this.dataset;
            }
            rendar(){


                this.main = this.svg.append("g")

                this.x = this.main.append("g")
                .attr("class", "axis axis-x")

                this.y = this.main.append("g")
                .attr("class", "axis axis-y")

                this.gridX = this.main.append("g")
                .attr("class", "grid grid-x")

                this.gridY = this.main.append("g")
                .attr("class", "grid grid-y")

                this.mask = this.main.append("clipPath")
                .attr("id", "js-chart__zoom--mask")
                .append("rect")
                .attr("class", "js-chart__zoom--mask-rect")

                this.brush = d3.brush()

                this.brushGroup = this.main.append("g")
                .attr("class", "x brush")

                this.pathGroups = this.main.append('g')
                .attr('class', 'path-group')

                this.legend = this.main.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(0,0)');

                this.lg = this.legend.selectAll('g')
                .data(this.dataset)
                .enter()
                .append('g')
                .attr("class", function(d,i){ return  'legend-' + i})
                .attr("data-index", function(d,i){ return  i});


                this.lg.append('circle')
                .attr("r", 5)
                .style('fill', d => d.color)
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 6)
                .attr('height', 6)

                this.lg.append('text')
                .attr('x', 8)
                .attr('y', 4)
                .style('fill', "currentColor")
                .style('font-size', "10px")
                .text(d => d.name);

                this.prevButton = document.createElement("button")
                this.prevButton.setAttribute("class","js-chart__zoom--ctrls js-chart__zoom--prev")
                this.prevButton.setAttribute("disabled","disabled")
                this.el.appendChild(this.prevButton)

                this.prevButton
                .addEventListener("click",() => {
                    this.zoomPrev()
                },false)

                this.nextButton = document.createElement("button")
                this.nextButton.setAttribute("class","js-chart__zoom--ctrls js-chart__zoom--next")
                this.nextButton.setAttribute("disabled","disabled")
                this.el.appendChild(this.nextButton)

                this.nextButton
                .addEventListener("click",() => {
                    this.zoomNext()
                },false)

                this.handleDblClick()

            }
            update(){

                this.chartUpdate()
                this.setLegend()
            }

            chartUpdate(){
                this.width = this.el.clientWidth; // グラフの幅
                this.height = this.el.clientHeight; // グラフの高さ

                this.yMins = []
                this.yMaxs = []

                if(this.dataset.length > 0){
                    this.dataset.forEach( (data) => {
                        this.yMins.push( d3.min( data.values ) )
                        this.yMaxs.push( d3.max( data.values ) )
                    })
                }

                this.parseTimes = []
                if(this.times.values.length > 0){
                    this.times.values.forEach((date,i) => {
                        this.parseTimes.push( this.parseDate(date) )
                    });
                }

                this.x0 = [d3.min( this.parseTimes ),d3.max( this.parseTimes )]
                this.y0 = [d3.min( this.yMins ),d3.max( this.yMaxs )]

                this.zoomHistory = [[this.x0,this.y0]]

                this.xScale = d3.scaleTime()
                .domain(this.x0)
                .range([this.margin.left, this.width - this.margin.right]);

                this.yScale = d3.scaleLinear()
                .domain(this.y0).nice()
                .range([this.height - this.margin.bottom, this.margin.top]);

                let xticks = 8
                let yticks = 8
                if(window.innerWidth < 1441){
                    xticks = 6
                    yticks = 6
                }
                if(window.innerWidth < 767){
                    xticks = 3
                }

                let format = d3.timeFormat("%Y-%m-%d");

                this.axisx = d3.axisBottom(this.xScale)
                .ticks(xticks)
                .tickFormat(format)

                this.axisy = d3.axisLeft(this.yScale)
                .ticks(yticks)

                this.gridAxisx = d3.axisBottom(this.xScale)
                .tickSize( -this.height + this.margin.top + this.margin.bottom)
                .ticks(xticks)
                .tickFormat(format)

                this.gridAxisy = d3.axisLeft(this.yScale)
                .tickSize(-this.width + this.margin.left + this.margin.right)
                .ticks(yticks)


                this.prevButton.setAttribute("disabled","disabled")
                this.nextButton.setAttribute("disabled","disabled")

                this.x.attr("transform", "translate(" + 0 + "," + (this.height - this.margin.bottom) + ")")
                .call(this.axisx)

                this.y.attr("transform", "translate(" + (this.margin.left) + "," + 0 + ")")
                .call(this.axisy)

                this.gridX.attr("transform", "translate(" + 0 + "," + (this.height - this.margin.bottom) + ")")
                .call(this.gridAxisx)
                .selectAll(".tick text")
                .remove()

                this.gridX
                .select(".domain")
                .remove()

                this.gridY.attr("transform", "translate(" + (this.margin.left) + "," + 0 + ")")
                .call(this.gridAxisy)
                .selectAll(".tick text")
                .remove()

                this.gridY
                .select(".domain")
                .remove()


                this.pathGroups.selectAll(".c-main__line").remove()
                this.paths = []
                this.lines = []
                this.dataset.forEach((d,i) => {
                    this.lines.push(
                        d3.line()
                        .x((d,j) => { return this.xScale( this.parseTimes[j] ); })
                        .y((d,j) => { return this.yScale( d ); })
                        .curve(d3.curveCatmullRom.alpha(.05))
                    );
                    const color =  d.color
                    this.paths.push(
                        this.pathGroups.append("path")
                        .attr("fill", "none")
                        .attr("stroke", color)
                        .attr("stroke-linejoin", "round")
                        .attr("class","c-main__line")
                    )
                });
                this.paths.forEach((path,i) => {
                    path
                    .datum(this.dataset[i].values)
                    .attr("fill", "none")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width",.8)
                    .attr("clip-path", "url(#js-chart__zoom--mask)")
                    .attr("d", this.lines[i])

                })

                this.brush
                .extent([
                    [this.margin.left, this.margin.top],
                    [this.width - this.margin.right , this.height - this.margin.bottom]
                ])
                .on("end", (event) => {
                    this.brushed(event)
                });

                this.brushGroup.call(this.brush)


                this.mask.attr("x", this.margin.left + 1 )
                .attr("y", this.margin.top)
                .attr("width", this.width - (this.margin.left + this.margin.right) )
                .attr("height", this.height - (this.margin.top + this.margin.bottom) )

            }

            //brushed() {
            //    const s = d3.event.selection;
            brushed(event) {
	        console.log(event);
                const s = event.selection;

                if(s){

                    const x0 = [this.xScale.invert(s[0][0]),this.xScale.invert(s[1][0])]
                    const y0 = [this.yScale.invert(s[1][1]),this.yScale.invert(s[0][1])]
                    this.xScale.domain(x0);
                    this.yScale.domain(y0);
                    this.svg.select(".brush").call(this.brush.move, null);

                    if(this.nowPosition != this.zoomHistory.length){
                        const l = this.zoomHistory.length - this.nowPosition
                        if(l > 0){
                            for (let i = 0; i < l; i++) {
                                this.zoomHistory.pop()
                            }
                        }
                    }
                    this.nowPosition ++
                    this.zoomHistory.push([x0,y0])

                    this.zoom();
                }
            }
            zoom(){
                this.zoomTransition = true
                const t = this.svg.transition().duration(300);

                this.x.transition(t).call(this.axisx)
                .on("end",() => {
                    this.zoomTransition = false
                })
                this.y.transition(t).call(this.axisy)

                this.gridY.transition(t).call(this.gridAxisy)
                this.gridX.transition(t).call(this.gridAxisx)

                this.paths.forEach((path,i) =>{

                    path
                    .datum(this.dataset[i].values)
                    .attr("d", this.lines[i]);

                })
                this.zoomed = true

                if(this.nowPosition == 1){
                    this.prevButton.setAttribute("disabled","disabled")
                }else{
                    this.prevButton.removeAttribute("disabled")
                }

                if(this.nowPosition > 0){
                    this.nextButton.removeAttribute("disabled")
                }
                if(this.nowPosition == this.zoomHistory.length){
                    this.nextButton.setAttribute("disabled","disabled")
                }

            }

            zoomPrev() {
                if(this.zoomTransition){
                    return false
                }
                if(this.nowPosition > 1){
                    if(this.nowPosition <= this.zoomHistory.length){
                        this.nowPosition--
                        const x0 = this.zoomHistory[this.nowPosition-1][0]
                        const y0 = this.zoomHistory[this.nowPosition-1][1]
                        this.xScale.domain(x0);
                        this.yScale.domain(y0).nice();
                        this.prevButton.setAttribute("disabled","disabled")
                        this.nextButton.setAttribute("disabled","disabled")

                        this.zoom();
                        if(this.nowPosition == 1){
                            this.zoomed = false
                        }
                    }
                }
            }
            zoomNext(){
                if(this.zoomTransition){
                    return false
                }
                if(this.nowPosition > 0){
                    if(this.nowPosition < this.zoomHistory.length){
                        this.nowPosition++
                        const x0 = this.zoomHistory[this.nowPosition-1][0]
                        const y0 = this.zoomHistory[this.nowPosition-1][1]
                        this.xScale.domain(x0);
                        this.yScale.domain(y0).nice();
                        this.prevButton.setAttribute("disabled","disabled")
                        this.nextButton.setAttribute("disabled","disabled")
                        this.zoom();
                    }
                }
            }
            zoomClear() {
                if(!this.zoomed){
                    return false
                }
                this.zoomTransition = true
                this.xScale.domain(this.x0)
                this.yScale.domain(this.y0).nice();

                const t = this.svg.transition().duration(300);
                this.x.transition(t).call(this.axisx)
                .on("end",() => {
                    this.zoomTransition = false
                })

                this.y.transition(t).call(this.axisy)
                this.gridY.transition(t).call(this.gridAxisy)
                this.gridX.transition(t).call(this.gridAxisx)


                this.zoomHistory = [[this.x0,this.y0]]

                this.paths.forEach((path,i) => {
                    path
                    .datum(this.dataset[i].values)
                    .attr("d", this.lines[i]);
                })

                this.zoomed = false

                this.nowPosition = 1
                this.prevButton.setAttribute("disabled","disabled")
                this.nextButton.setAttribute("disabled","disabled")


            }
            setLegend(){
                const self = this
                let nodeWidth = (d) => d.getBBox().width;
                let offset = 0;

                this.lg.attr('transform', function(d, i) {
                    let x = offset;
                    offset += nodeWidth(this) + self.labelAfter;
                    return 'translate(' + x + ',' + 15 +')';
                });

                this.legend.attr('transform', function() {
                    return 'translate(' + ( self.width - nodeWidth(this) )+ ','+ (self.el.clientHeight - 20) +')';
                });

            }

            handleDblClick(){
                this.main.on("dblclick",() => {
                    if(this.zoomed){
                        this.zoomClear()
                    }
                })
            }
        }
        const init = () => {
            const chart = new MultipleLines("#js-chart__zoom")

            chart.init()
            chart.dataset = [
            {
                name: "Data A",
                color:"#007bff",
                values:[20,45,123,124,203,36,160,280,235,20,22,90,46,67,98,317,235,34,67,80,67,120,300]
            },{
                name: "Data B",
                color:"#2ad4ac",
                values:[200,145,23,14,63,56,32,120,185,120,60,78,91,247,255,120,84,20,12,27,118,160,120]
            },{
                name: "Data C",
                color:"#ffc107",
                values:[121,185,99,56,15,12,52,190,70,60,150,118,222,107,109,170,43,80,120,70,60,313,160]
            }]
            chart.times = {
                name: "date",
                values:["2020-12-01T00:00:00","2020-12-02T00:00:00","2020-12-03T00:00:00","2020-12-04T00:00:00","2020-12-05T00:00:00","2020-12-06T00:00:00","2020-12-07T00:00:00","2020-12-08T00:00:00","2020-12-09T00:00:00","2020-12-10T00:00:00","2020-12-11T00:00:00","2020-12-12T00:00:00","2020-12-13T00:00:00","2020-12-14T00:00:00","2020-12-15T00:00:00","2020-12-16T00:00:00","2020-12-17T00:00:00","2020-12-18T00:00:00","2020-12-19T00:00:00","2020-12-20T00:00:00","2020-12-21T00:00:00","2020-12-22T00:00:00","2020-12-23T00:00:00"]
            }

            chart.rendar()
            chart.update()
            window.addEventListener("resize",function () {
                chart.update()
            });
        }


        window.addEventListener("load",init)

