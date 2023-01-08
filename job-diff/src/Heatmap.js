import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Heatmap = () => {
  const heatmapRef = useRef(null);

  useEffect(() => {
    const data = [];

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 25; col++) {
        data.push({
          row: row + 1,
          col: col + 1,
          value: Math.random(),
        });
      }
    }
    let height = window.innerHeight - 100;
    let width = height * 1.25;

    const cellSize = Math.sqrt((height * width) / 500) - 2;
    const margin = { top: 0, right: 0, bottom: 30, left: 30 };
    const color = d3.scaleSequential(d3.interpolateBlues);

    let transW = window.innerWidth / 2 - width / 2
    let transH = window.innerHeight / 2 - height / 2

    var svg = d3.select(heatmapRef.current)
      .append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("background-color", "lightblue")
      
      .append("g")
      .attr("transform", "translate(" + transW + "," + transH + ")")
      .call(d3.zoom().on("zoom", function (event) {
        svg.attr("transform", event.transform)
      })).append('g')

    svg
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")

    const x = d3
      .scaleBand()
      .range([0, width - margin.left - margin.right])
      .domain(d3.range(1, 26))
      .padding(0.1);

    const y = d3
      .scaleBand()
      .range([0, height - margin.top - margin.bottom])
      .domain(d3.range(1, 21))
      .padding(0.1);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(2,0)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)");

    const cells = svg.selectAll()
      .data(data, (d) => d.row + ':' + d.col);

    cells.enter()
      .append("rect")
      .attr("x", (d) => x(d.col))
      .attr("y", (d) => y(d.row))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", (d) => color(d.value))
      .on("mouseover", function (d) {
        d3.select(this).style("opacity", 0.5);
      })
      .on("mouseout", function (d) {
        d3.select(this).style("opacity", 1);
      });

  }, []);

  return <div style={{ textAlign: "center" }} ref={heatmapRef} />;
};

export default Heatmap;