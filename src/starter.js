import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 25, right: 20, bottom: 60, left: 70 };
// parsing & formatting
const formatXAxis = d3.format("~s");

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 55]);
const colorScale = d3
  .scaleOrdinal()
  .range(["#8160C8", "#FFA602", "#CDC0E4", "#cfcfcf"]);

// axis

const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]);

const yAxis = d3.axisLeft(yScale).ticks(5);

const tooltip = d3
  .select("#svg-container")
  .append("div")
  .attr("class", "tooltip");
// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let data = [];
let circles;
let region;

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
  console.log(raw_data);

  data = raw_data.map((d) => {
    d.population = parseInt(d.population);
    d.income = parseInt(d.income);
    d.year = parseInt(d.year);
    d.life_expectancy = parseInt(d.life_expectancy);
    return d;
  });

  //   console.log(data);
  region = [...new Set(data.map((d) => d.region))];
  console.log(region);
  //   xScale.domain(d3.extent(data, (d) => d.income));
  xScale.domain([500, d3.max(data, (d) => d.income)]);
  yScale.domain(d3.extent(data, (d) => d.life_expectancy));
  radiusScale.domain([0, d3.max(data, (d) => d.population)]);
  colorScale.domain(region);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  circles = svg
    .selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population))
    .attr("fill", (d) => colorScale(d.region))
    .attr("stroke", "#fff")
    .on("mousemove", function (event, d, index) {
      tooltip
        .style("left", event.pageX + 0 + "px")
        .style("top", event.pageY - 52 + "px")
        .style("display", "block")
        .html(`${d.country}`);

      d3.select(this).style("stroke-width", 3).attr("stroke", "#111");
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
      d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
    });
});
