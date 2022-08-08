import * as d3 from "d3";

// 1. 描画用のデータ準備
const nodesData = [
  { id: "お母さん" },
  { id: "赤ずきんちゃん" },
  { id: "おばあさん" },
  { id: "オオカミ" },
  { id: "猟師さん" },
  { id: "お花" }
];

const linksData = [
  { source: 0, target: 1 },
  { source: 1, target: 2 },
  { source: 3, target: 1 },
  { source: 3, target: 2 },
  { source: 4, target: 3 },
  { source: 1, target: 5 },
  { source: 5, target: 2 }
];

// JS内に埋め込んだデータでも、d3.json()で外部から読み込んだデータでも描画できるように
// 描画部分は別の関数に分けている
process_network(nodesData, linksData);


function process_network(nodesData, linksData) {
  console.log(linksData);

  // 2. svg要素を配置
  var link = d3
    .select("#drawarea")
    .selectAll("line")
    .data(linksData)
    .enter()
    .append("line")
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  var node = d3
    .select("#drawarea")
    .selectAll("g")
    .data(nodesData)
    .enter()
    .append("g")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
  
  node
    .append("circle")
    .attr("r", 24)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("fill", "peachpuff");

  node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("fill", "gray")
    .text(function(d) {
      return d.id;
    })
    .append("title")
    .text(function(d) {
      return d.id;
    });

  // 3. forceSimulation設定
  // ここでエッジの長さや描画の中心などを決める
  var simulation = d3
    .forceSimulation(nodesData)
    .velocityDecay(0.3)
    .alpha(0.7)
    .force("link", d3.forceLink().distance(250))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(200, 200));

  simulation.nodes(nodesData).on("tick", ticked);
  simulation.force("link").links(linksData);

  // 4. forceSimulation 描画更新用関数
  function ticked() {
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
    node
      .select("circle")
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });
    
    // 追加: ノードの下に付けたテキストもforceSimulationで追従できるように設定する
    node
      .select("text")
      .attr("dx", function(d) {
        return d.x;
      })
      .attr("dy", function(d) {
        return d.y + 40;
      });
  }

  // 5. ドラッグ時のイベント関数
  //function dragstarted(d) {
  //  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  //  d.fx = d.x;
  //  d.fy = d.y;
  //}

  function dragstarted(e,d) {
    if (!e.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  //function dragged(d) {
  //  d.fx = d3.event.x;
  //  d.fy = d3.event.y;
  //}

  function dragged(e,d) {
    d.fx = e.x;
    d.fy = e.y;
  }

  //function dragended(d) {
  //  if (!d3.event.active) simulation.alphaTarget(0);
  //  d.fx = null;
  //  d.fy = null;
  //}

  function dragended(e,d) {
    if (!e.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

