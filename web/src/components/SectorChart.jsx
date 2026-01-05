import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SectorChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const chartData = data.filter(d => d.year % 5 === 0 || d.year > 2018);

    const keys = ["agriculture", "manufacturing", "construction", "trade", "transport", "other"];
    const colors = {
      agriculture: "#4ade80", // Green
      manufacturing: "#60a5fa", // Blue
      construction: "#facc15", // Yellow
      trade: "#fb923c", // Orange
      transport: "#a78bfa", // Purple
      other: "#9ca3af" // Gray
    };

    const stack = d3.stack().keys(keys);
    const stackedData = stack(chartData);

    const margin = { top: 20, right: 120, bottom: 40, left: 60 }; // Marge droite pour légende
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.year))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.totalValueAdded)])
      .range([height, 0]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    // Barres
    svg.selectAll("g.layer")
      .data(stackedData)
      .enter().append("g")
      .attr("fill", d => colors[d.key])
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => x(d.data.year))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // Légende
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    keys.reverse().forEach((key, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("rect").attr("width", 15).attr("height", 15).attr("fill", colors[key]);
      row.append("text").attr("x", 20).attr("y", 12).text(key).style("font-size", "12px").style("text-transform", "capitalize");
    });

  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Structure Économique (Valeur Ajoutée par Secteur)</h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default SectorChart;