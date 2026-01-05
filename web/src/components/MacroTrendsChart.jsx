
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { calculateProjection } from '../utils/dataProcessing';

const MacroTrendsChart = ({ data, metric, title, subtitle, color, format = ".2s" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    
    const { width: containerWidth } = wrapperRef.current.getBoundingClientRect();
    
    const projections = calculateProjection(data, metric);
    const fullData = [...data, ...projections];

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const gradientId = `gradient-${metric}`;
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.2);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);

    const x = d3.scaleLinear().domain(d3.extent(fullData, d => d.year)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(fullData, d => d[metric]) * 1.05]).range([height, 0]);

    
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat("").ticks(5))
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.1)
      .select(".domain").remove();

    
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(width < 400 ? 5 : 10));
    
    xAxis.select(".domain").style("stroke", "#e2e8f0"); 
    xAxis.selectAll("text").style("fill", "#64748b").style("font-size", "11px");

    const yAxis = svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(format)(d)));
      
    yAxis.select(".domain").remove(); 
    yAxis.selectAll("text").style("fill", "#64748b").style("font-size", "11px");

    
    const line = d3.line()
      .curve(d3.curveMonotoneX) 
      .x(d => x(d.year))
      .y(d => y(d[metric]));

    
    const area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d[metric]));

    
    svg.append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", area);

    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("d", line);
      
    
    const projData = [data[data.length-1], ...projections];
    svg.append("path")
      .datum(projData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.6)
      .attr("d", line);

    
    const crises = [{ s: 2008, e: 2009 }, { s: 2020, e: 2021 }];
    svg.selectAll(".crisis")
      .data(crises)
      .enter().append("rect")
      .attr("x", d => x(d.s))
      .attr("width", d => x(d.e) - x(d.s))
      .attr("y", 0)
      .attr("height", height)
      .attr("fill", "#f1f5f9") 
      .lower();

  }, [data, metric, color]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex-grow w-full" ref={wrapperRef}>
        <svg ref={svgRef} className="w-full h-full overflow-visible"></svg>
      </div>
    </div>
  );
};

export default MacroTrendsChart;