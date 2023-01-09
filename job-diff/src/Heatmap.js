import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const Heatmap = () => {
  const heatmapRef = useRef(null);
  const resetButtonRef = useRef(null);
  const zoomInRef = useRef(null);
  const zoomOutRef = useRef(null);
  const color = d3.scaleSequential(d3.interpolateBlues);

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

    const cellSize = Math.sqrt((height * width) / 500) - 3;
    const margin = { top: 0, right: 0, bottom: 30, left: 30 };

    let transW = window.innerWidth / 2 - width / 2;
    let transH = window.innerHeight / 2 - height / 2;

    const svg = d3
      .select(heatmapRef.current)
      .append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("background-color", "#f7f6f5")
      .append("g")
      .attr("transform", "translate(" + transW + "," + transH + ")");

    function zoomed({ transform }) {
      g.attr("transform", transform);
    }

    const zoom = d3.zoom().scaleExtent([0.5, 40]).on("zoom", zoomed);

    const g = svg.append("g");

    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)
      .append("g");

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

    g.append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(2,0)")
      .style("text-anchor", "end")
      .style("color", "rgb(60,64,67)");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)")
      .style("color", "rgb(60,64,67)");

    const cells = g.selectAll().data(data, (d) => d.row + ":" + d.col);

    const tooltip = d3
      .select(heatmapRef.current)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute");

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    };
    const mousemove = function (event, d) {
      tooltip
        .html("The exact value of<br>this cell is: " + d.value)
        .style("left", event.x - 125 + "px")
        .style("top", event.y + 30 + "px");
    };
    const mouseleave = function (event, d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    cells
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.col))
      .attr("y", (d) => y(d.row))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", (d) => color(d.value))
      .style("stroke-width", 2)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    svg.call(zoom);

    const resetZoom = () => {
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(g.node()).invert([width / 2, height / 2])
        );
    };

    resetButtonRef.current.addEventListener("click", resetZoom);

    const zoomIn = () => {
      zoom.scaleBy(svg.transition().duration(750), 1.2);
    };

    zoomInRef.current.addEventListener("click", zoomIn);

    const zoomOut = () => {
      zoom.scaleBy(svg.transition().duration(750), 0.8);
    };

    zoomOutRef.current.addEventListener("click", zoomOut);

    function legend({
      color,
      title,
      tickSize = 6,
      widthL = 150,
      heightL = 44 + tickSize,
      marginTop = 18,
      marginRight = 0,
      marginBottom = 16 + tickSize,
      marginLeft = 0,
      ticks = width / 64,
      tickFormat,
      tickValues,
    } = {}) {
      g.append("svg")
        .attr("width", widthL)
        .attr("height", heightL)
        .attr("viewBox", [0, 0, widthL, heightL])
        .style("overflow", "visible")
        .style("display", "block");

      let tickAdjust = (s) =>
        s
          .selectAll(".tick line")
          .attr("y1", marginTop + marginBottom - heightL)
          .attr("transform", `translate(0,${-width + 28})`);

      let x;

      // Sequential
      if (color.interpolator) {
        x = Object.assign(
          color
            .copy()
            .interpolator(
              d3.interpolateRound(marginLeft, widthL - marginRight)
            ),
          {
            range() {
              return [marginLeft, widthL - marginRight];
            },
          }
        );

        g.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop - width)
          .attr("width", widthL - marginLeft - marginRight)
          .attr("height", heightL - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL())
          .attr("transform", "rotate(90)");

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
          if (tickValues === undefined) {
            const n = Math.round(ticks + 1);
            tickValues = d3
              .range(n)
              .map((i) => d3.quantile(color.domain(), i / (n - 1)));
          }
          if (typeof tickFormat !== "function") {
            tickFormat = d3.format(
              tickFormat === undefined ? ",f" : tickFormat
            );
          }
        }
      }

      g.append("g")
        .call((s) => s.select(".domain").remove())
        .call((s) =>
          s
            .append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - heightL - 6 - width + 28)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(title)
        )
        .attr("transform", "rotate(90)");
    }

    function ramp(color, n = 256) {
      var canvas = document.createElement("canvas");
      canvas.width = n;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
      }
      return canvas;
    }

    legend({
      color: d3.scaleSequential([0, 100], d3.interpolateBlues),
      title: "Changes",
    });
  }, [color]);

  return (
    <>
      <div ref={heatmapRef} />
      <SpeedDial
        ariaLabel="test"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        direction={"up"}
      >
        <SpeedDialAction
          key={"reCenter"}
          icon={<GpsFixedIcon />}
          tooltipTitle={"reCenter"}
          tooltipOpen
          ref={resetButtonRef}
        />
        <SpeedDialAction
          key={"zoomOut"}
          icon={<RemoveCircleOutlineIcon />}
          tooltipTitle={"zoomOut"}
          tooltipOpen
          ref={zoomOutRef}
        />
        <SpeedDialAction
          key={"zoomIn"}
          icon={<ControlPointIcon />}
          tooltipTitle={"zoomIn"}
          tooltipOpen
          ref={zoomInRef}
        />
      </SpeedDial>
    </>
  );
};

export default Heatmap;
