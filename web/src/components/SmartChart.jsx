import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { calculateProjection } from '../utils/dataProcessing';

const SmartChart = ({ data, viewMode, showCrises, showProjection }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    
    const container = containerRef.current;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    
    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const defs = svg.append("defs");
    
    
    const gradBlue = defs.append("linearGradient").attr("id", "gradBlue").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    gradBlue.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.6);
    gradBlue.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0);

    
    const gradPurple = defs.append("linearGradient").attr("id", "gradPurple").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    gradPurple.append("stop").attr("offset", "0%").attr("stop-color", "#8b5cf6").attr("stop-opacity", 0.6);
    gradPurple.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6").attr("stop-opacity", 0);

    
    
    
    if (viewMode === 'growth' || viewMode === 'wellbeing' || viewMode === 'population') {
      let metric = 'gdp';
      let color = '#3b82f6';
      let label = 'PIB (USD)';
      
      if (viewMode === 'wellbeing') { metric = 'householdConsumption'; color = '#10b981'; label = 'Conso. Ménages'; }
      if (viewMode === 'population') { metric = 'population'; color = '#f43f5e'; label = 'Population'; }

      
      let displayData = [...data];
      if (showProjection) {
        const projections = calculateProjection(data, metric, 5); 
        displayData = [...data, ...projections];
      }

      const x = d3.scaleLinear().domain(d3.extent(displayData, d => d.year)).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(displayData, d => d[metric]) * 1.1]).range([height, 0]);

      
      svg.append("g").attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x).tickFormat(d3.format("d")))
         .attr("color", "#94a3b8").select(".domain").remove();
         
      svg.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(".2s")(d)))
         .attr("color", "#94a3b8").select(".domain").remove();

      
      const line = d3.line().curve(d3.curveMonotoneX).x(d => x(d.year)).y(d => y(d[metric]));
      
      
      const area = d3.area().curve(d3.curveMonotoneX).x(d => x(d.year)).y0(height).y1(d => y(d[metric]));

      svg.append("path")
         .datum(displayData.filter(d => !d.isProjection))
         .attr("fill", viewMode === 'wellbeing' ? "url(#gradPurple)" : "url(#gradBlue)")
         .attr("d", area);

      svg.append("path")
         .datum(displayData)
         .attr("fill", "none")
         .attr("stroke", color)
         .attr("stroke-width", 3)
         .attr("d", line);

      
      if (showProjection) {
         const projPart = displayData.filter(d => d.isProjection || d.year === data[data.length-1].year);
         svg.append("path")
            .datum(projPart)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8,8")
            .attr("d", line);
            
         
         svg.append("text")
            .attr("x", x(displayData[displayData.length-1].year))
            .attr("y", y(displayData[displayData.length-1][metric]) - 15)
            .attr("text-anchor", "end")
            .attr("fill", color)
            .attr("font-size", "12px")
            .text("Projection (Tendance)");
      }
    }

    
    else if (viewMode === 'sectors') {
      const keys = ["agriculture", "manufacturing", "trade", "transport", "other"];
      const colors = d3.scaleOrdinal().domain(keys).range(["#4ade80", "#60a5fa", "#fb923c", "#a78bfa", "#94a3b8"]);
      
      const stackedData = d3.stack().keys(keys)(data);

      const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d.totalValueAdded)]).range([height, 0]);

      svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d"))).attr("color", "#94a3b8");
      svg.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d))).attr("color", "#94a3b8");

      const area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.data.year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

      svg.selectAll("mylayers")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "layer")
        .style("fill", d => colors(d.key))
        .style("opacity", 0.8)
        .attr("d", area)
        .on("mouseover", function() { d3.select(this).style("opacity", 1).style("stroke", "white"); })
        .on("mouseout", function() { d3.select(this).style("opacity", 0.8).style("stroke", "none"); });
        
      
      const legend = svg.append("g").attr("transform", `translate(20, 0)`);
      keys.forEach((key, i) => {
          legend.append("circle").attr("cy", i*20).attr("r", 6).style("fill", colors(key));
          legend.append("text").attr("x", 15).attr("y", i*20+4).text(key).style("font-size", "12px").style("fill", "#cbd5e1").style("text-transform", "capitalize");
      });
    }

    
    else if (viewMode === 'trade') {
        const x = d3.scaleLinear().domain([0, d3.max(data, d => d.imports + d.exports)]).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.gdp)]).range([height, 0]);

        
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format(".2s"))).attr("color", "#94a3b8");
        svg.append("text").attr("x", width).attr("y", height - 10).text("Volume Commerce (Imp+Exp)").attr("fill", "#64748b").attr("text-anchor", "end").style("font-size", "10px");
        
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s"))).attr("color", "#94a3b8");
        svg.append("text").attr("x", 10).attr("y", 10).text("PIB").attr("fill", "#64748b").style("font-size", "10px");

        
        const line = d3.line().curve(d3.curveCatmullRom).x(d => x(d.imports + d.exports)).y(d => y(d.gdp));
        
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#334155").attr("stroke-width", 1).attr("d", line);

        
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(d.imports + d.exports))
            .attr("cy", d => y(d.gdp))
            .attr("r", d => d.year % 5 === 0 ? 6 : 3) 
            .style("fill", d => d.year === 2020 || d.year === 2008 ? "#ef4444" : "#3b82f6") 
            .style("fill-opacity", 0.7)
            .style("stroke", "white").style("stroke-width", 1);
            
        
        svg.selectAll(".year-label")
            .data(data.filter(d => d.year % 5 === 0 || d.year === 2008 || d.year === 2020))
            .enter().append("text")
            .attr("x", d => x(d.imports + d.exports) + 8)
            .attr("y", d => y(d.gdp) + 4)
            .text(d => d.year)
            .style("fill", "#e2e8f0").style("font-size", "10px");
    }

    
    if (showCrises) {
        const crises = [
            { year: 2008, label: "Crise Financière" },
            { year: 2020, label: "COVID-19" }
        ];

        
        if (viewMode !== 'trade') {
            const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, width]);
            
            const crisisG = svg.append("g").attr("class", "crisis-overlay");
            
            crises.forEach(c => {
                if (x(c.year) > 0 && x(c.year) < width) {
                    
                    crisisG.append("line")
                        .attr("x1", x(c.year)).attr("x2", x(c.year))
                        .attr("y1", 0).attr("y2", height)
                        .attr("stroke", "#ef4444")
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray", "4,4");
                    
                    
                    crisisG.append("rect")
                        .attr("x", x(c.year) - 40).attr("y", -30)
                        .attr("width", 80).attr("height", 25)
                        .attr("rx", 4)
                        .attr("fill", "#ef4444");
                        
                    crisisG.append("text")
                        .attr("x", x(c.year)).attr("y", -14)
                        .attr("text-anchor", "middle")
                        .attr("fill", "white")
                        .style("font-size", "10px")
                        .style("font-weight", "bold")
                        .text(c.label);
                }
            });
        }
    }

  }, [data, viewMode, showCrises, showProjection]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
        <svg ref={svgRef} className="overflow-visible"></svg>
    </div>
  );
};

export default SmartChart;