
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TradeScatter = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const scatterData = data.map(d => ({
      ...d,
      tradeVolume: d.imports + d.exports
    }));

    const x = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.tradeVolume)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.gdp)])
      .range([height, 0]);
      
    
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(scatterData, d => d.year));

    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));
    
    
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Volume Échanges (Imp+Exp)")
      .style("font-size", "10px");

    svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
    
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", 0)
      .text("PIB (GDP)")
      .style("font-size", "10px");

    
    svg.selectAll("circle")
      .data(scatterData)
      .enter().append("circle")
      .attr("cx", d => x(d.tradeVolume))
      .attr("cy", d => y(d.gdp))
      .attr("r", 6)
      .attr("fill", d => colorScale(d.year))
      .attr("stroke", "#333")
      .attr("opacity", 0.8)
      .append("title") 
      .text(d => `Année: ${d.year}\nPIB: ${d3.format(".2s")(d.gdp)}\nTrade: ${d3.format(".2s")(d.tradeVolume)}`);

  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Corrélation Commerce vs PIB</h3>
      <p className="text-xs text-gray-500 mb-2">Chaque point représente une année. Plus bleu foncé = plus récent.</p>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default TradeScatter;