import * as d3 from "d3";

     var data = [
        {name: "A", value: 5000},
        {name: "B", value: 2500},
        {name: "C", value: 1250},
        {name: "D", value: 1000},
        {name: "E", value: 250},
      ];
 
      var width = 150;
      var height = 150;
 
      // dataの nameごとにグラフで使用する色を設定
      var color = d3.scaleOrdinal()
          .domain(data.map(d => d.name))
          .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
 
      // 円グラフの内側・外側半径の設定
      var arc = d3.arc()
          .innerRadius(0)
          .outerRadius(Math.min(width, height) / 2 - 1);
 
      // 円グラフのラベル表示位置を設定
      const radius = Math.min(width, height) / 2 * 0.57;
      var arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);
 
      // 円グラフ作成用の角度を計算
      var arcs = d3.pie()
          .sort(null) // data配列の順番でグラフを作成（␈未指定の場合は、valueの降順）
          .value(function(d) { return d.value; })
          (data);
 
      // 円グラフ描画エリアを選択
      var svg = d3.select("#chart")
          .attr("text-anchor", "middle")
          .style("font", "12px sans-serif")
 
      // g要素を追加
      const g = svg.append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);
 
      // g要素に各データのpath要素を追加
      g.selectAll("path")
        .data(arcs)
        .enter().append("path")
          .attr("fill", d => color(d.data.name))
          .attr("stroke", "white")
          .attr("d", arc)
        .append("title")
          .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
 
      // ␈データごとにtext要素を設定
      const text = g.selectAll("text")
        .data(arcs)
        .enter().append("text")
          .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
          .attr("dy", "0.35em");
 
      // text要素にデータ名を設定（dataのnameを␈設定）
      text.append("tspan")
          .attr("x", 0)
          .attr("y", "-0.7em")
          .style("font-weight", "bold")
          .text(d => d.data.name);
 
      // text要素にデータ名を設定（dataのvalueを␈設定）
      text.filter( d => (d.endAngle - d.startAngle) > .7535).append("tspan")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill-opacity", 0.7)
          .text(d => d.data.value.toLocaleString());
 
      // clickイベントを設定
      d3.selectAll("path").on("click",function(data,idx,elem){
        var msg = "data:" + data.value + " idx:" + idx + " elem:" + elem + " d3.event.pageX: " + d3.event.pageX + " d3.mouse: " + d3.mouse(this) ;
        alert(msg);
      });

