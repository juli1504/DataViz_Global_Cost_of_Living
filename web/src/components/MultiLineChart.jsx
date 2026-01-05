import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MultiLineChart = ({ datasets, metric, viewMode }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [hoverInfo, setHoverInfo] = useState(null);

  
  const colorPalette = ["#3b82f6", "#ef4444", "#10b981", "#eab308", "#a855f7"];

  useEffect(() => {
    if (!datasets || datasets.length === 0) return;

    const wrapper = wrapperRef.current;
    const { width, height } = wrapper.getBoundingClientRect();
    const margin = { top: 20, right: 100, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl.attr("width", width).attr("height", height)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    
    const allPoints = datasets.flatMap(d => d.data);
    
    
    const x = d3.scaleLinear()
      .domain(d3.extent(allPoints, d => d.year))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allPoints, d => d[metric]) * 1.1])
      .range([chartHeight, 0]);

    
    svg.append("g").attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#94a3b8");
    
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .attr("color", "#94a3b8");

    
    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat("")).attr("opacity", 0.1);

    
    const line = d3.line().curve(d3.curveMonotoneX).x(d => x(d.year)).y(d => y(d[metric]));

    datasets.forEach((dataset, i) => {
      const color = colorPalette[i % colorPalette.length];
      
      
      svg.append("path")
        .datum(dataset.data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", line);
      
      
      const lastPoint = dataset.data[dataset.data.length - 1];
      if (lastPoint) {
        svg.append("text")
          .attr("x", x(lastPoint.year) + 5)
          .attr("y", y(lastPoint[metric]))
          .text(dataset.country)
          .attr("fill", color)
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .attr("alignment-baseline", "middle");
      }
    });

    
    const overlay = svg.append("rect")
      .attr("width", chartWidth).attr("height", chartHeight)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const xYear = Math.round(x.invert(mouseX));
        
        
        const values = datasets.map((ds, i) => {
          const point = ds.data.find(d => d.year === xYear);
          return {
            country: ds.country,
            color: colorPalette[i % colorPalette.length],
            value: point ? point[metric] : null,
            year: xYear
          };
        }).sort((a,b) => b.value - a.value);

        setHoverInfo({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY, values, year: xYear });
      })
      .on("mouseleave", () => setHoverInfo(null));

    
    if (hoverInfo) {
      svg.append("line")
        .attr("x1", x(hoverInfo.year)).attr("x2", x(hoverInfo.year))
        .attr("y1", 0).attr("y2", chartHeight)
        .attr("stroke", "white").attr("stroke-dasharray", "4,4").attr("opacity", 0.5);
    }

  }, [datasets, metric, hoverInfo]); 

  return (
    <div ref={wrapperRef} className="w-full h-full relative">
      <svg ref={svgRef} className="overflow-visible"></svg>
      
      {/* TOOLTIP COMPARATIF */}
      {hoverInfo && (
        <div 
          className="absolute bg-slate-900/95 border border-slate-600 p-3 rounded-lg shadow-2xl pointer-events-none z-50 min-w-[150px]"
          style={{ left: hoverInfo.x + 20, top: 20 }}
        >
          <div className="font-bold text-white border-b border-slate-700 mb-2 pb-1 text-center">{hoverInfo.year}</div>
          {hoverInfo.values.map(v => (
             <div key={v.country} className="flex justify-between items-center gap-4 text-xs mb-1">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full" style={{background: v.color}}></span>
                 <span className="text-slate-300 font-medium">{v.country}</span>
               </div>
               <span className="text-white font-mono">{v.value ? d3.format(".2s")(v.value) : "-"}</span>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiLineChart;