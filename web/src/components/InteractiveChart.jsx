import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateProjection } from '../utils/dataProcessing';

const InteractiveChart = ({ data, viewMode, showCrises, showProjection, onHover }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltipData, setTooltipData] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 40, left: 0 }; 
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    
    let displayData = [...data];
    let metric = 'gdp';
    let color = '#3b82f6'; 
    let format = ".3s";
    
    
    if (viewMode === 'wellbeing') { metric = 'householdConsumption'; color = '#10b981'; } 
    if (viewMode === 'population') { metric = 'population'; color = '#f43f5e'; format = ".2s"; } 

    
    if ((viewMode === 'growth' || viewMode === 'population') && showProjection) {
        const projections = calculateProjection(data, metric, 5);
        displayData = [...data, ...projections];
    }

    
    const x = d3.scaleLinear()
      .domain(d3.extent(displayData, d => d.year))
      .range([0, chartWidth]);

    
    let yMax = 0;
    if (viewMode === 'sectors') {
        yMax = d3.max(displayData, d => d.totalValueAdded);
    } else if (viewMode === 'trade') {
        yMax = d3.max(displayData, d => d.gdp);
    } else {
        yMax = d3.max(displayData, d => d[metric]);
    }
    
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([chartHeight, 0]);

    

    
    if (viewMode === 'sectors') {
        const keys = ["agriculture", "manufacturing", "construction", "trade", "transport", "other"];
        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(["#22c55e", "#3b82f6", "#eab308", "#f97316", "#a855f7", "#64748b"]); 

        const stackedData = d3.stack().keys(keys)(displayData);

        const area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(d => x(d.data.year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        svg.selectAll("path")
            .data(stackedData)
            .enter().append("path")
            .attr("fill", d => colorScale(d.key))
            .attr("d", area)
            .attr("opacity", 0.8);
    } 
    
    
    else if (viewMode === 'trade') {
        const xTrade = d3.scaleLinear()
            .domain([0, d3.max(displayData, d => d.imports + d.exports)])
            .range([0, chartWidth]);

        
        svg.append("g").attr("class", "grid").attr("transform", `translate(0,${chartHeight})`)
           .call(d3.axisBottom(xTrade).ticks(5).tickSize(-chartHeight).tickFormat("")).attr("opacity", 0.1);
        svg.append("g").attr("class", "grid")
           .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat("")).attr("opacity", 0.1);

        
        const line = d3.line().curve(d3.curveCatmullRom).x(d => xTrade(d.imports + d.exports)).y(d => y(d.gdp));
        svg.append("path").datum(displayData).attr("fill", "none").attr("stroke", "#475569").attr("stroke-width", 2).attr("d", line);

        
        svg.selectAll("circle")
            .data(displayData)
            .enter().append("circle")
            .attr("cx", d => xTrade(d.imports + d.exports))
            .attr("cy", d => y(d.gdp))
            .attr("r", d => d.year % 5 === 0 ? 6 : 3)
            .attr("fill", d => d.year === 2008 || d.year === 2020 ? "#ef4444" : "#3b82f6")
            .attr("opacity", 0.8);
    }

    
    else {
        
        const defs = svg.append("defs");
        const gradientId = `gradient-${viewMode}`;
        const gradient = defs.append("linearGradient").attr("id", gradientId).attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.5);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);

        const area = d3.area().curve(d3.curveMonotoneX).x(d => x(d.year)).y0(chartHeight).y1(d => y(d[metric]));
        const line = d3.line().curve(d3.curveMonotoneX).x(d => x(d.year)).y(d => y(d[metric]));

        
        svg.append("path").datum(displayData.filter(d => !d.isProjection)).attr("fill", `url(#${gradientId})`).attr("d", area);
        svg.append("path").datum(displayData).attr("fill", "none").attr("stroke", color).attr("stroke-width", 3).attr("d", line);
        
        
        if (showProjection) {
             const projData = displayData.filter(d => d.isProjection || d.year === data[data.length-1].year);
             svg.append("path").datum(projData).attr("fill", "none").attr("stroke", color).attr("stroke-width", 3).attr("stroke-dasharray", "6,6").attr("d", line);
        }
    }

    
    
    const overlay = svg.append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", "transparent")
        .style("cursor", "crosshair")
        .on("mousemove", (event) => {
            
            const [mouseX] = d3.pointer(event);
            
            
            if (viewMode === 'trade') return;

            const xYear = x.invert(mouseX);
            const bisect = d3.bisector(d => d.year).left;
            const index = bisect(displayData, xYear, 1);
            const d0 = displayData[index - 1];
            const d1 = displayData[index];
            
            const d = (d1 && d0) ? (xYear - d0.year > d1.year - xYear ? d1 : d0) : d0;

            if (d) {
                setCursorPosition(x(d.year));
                setTooltipData(d);
                if (onHover) onHover(d); 
            }
        })
        .on("mouseleave", () => {
            setTooltipData(null);
            setCursorPosition(null);
            if (onHover) onHover(null);
        });


    
    if (cursorPosition !== null && viewMode !== 'trade') {
        svg.append("line")
            .attr("x1", cursorPosition)
            .attr("x2", cursorPosition)
            .attr("y1", 0)
            .attr("y2", chartHeight)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", 0.5)
            .style("pointer-events", "none");
            
        svg.append("circle")
            .attr("cx", cursorPosition)
            .attr("cy", viewMode === 'sectors' ? 0 : y(tooltipData[metric]))
            .attr("r", 4)
            .attr("fill", "white")
            .style("pointer-events", "none");
    }

    svg.append("g")
       .attr("transform", `translate(0,${chartHeight})`)
       .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5))
       .select(".domain").remove();
       
    svg.selectAll(".tick text").attr("fill", "#94a3b8").attr("dy", "15");

    if (showCrises && viewMode !== 'trade') {
         [2008, 2020].forEach(year => {
             const xPos = x(year);
             if (xPos > 0 && xPos < chartWidth) {
                 svg.append("rect")
                    .attr("x", xPos - 2)
                    .attr("y", 0)
                    .attr("width", 4)
                    .attr("height", chartHeight)
                    .attr("fill", "#ef4444")
                    .attr("opacity", 0.3);
             }
         });
    }

  }, [data, viewMode, showCrises, showProjection, tooltipData]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
        <svg ref={svgRef} className="overflow-visible block"></svg>
        
        {tooltipData && viewMode === 'sectors' && (
            <div 
                className="absolute top-0 bg-slate-900/95 border border-slate-700 p-4 rounded-lg shadow-2xl backdrop-blur-md pointer-events-none z-50 text-xs w-64 transition-all duration-75"
                style={{ left: cursorPosition > 300 ? cursorPosition - 270 : cursorPosition + 20 }}
            >
                <div className="font-bold text-white text-lg mb-2 border-b border-slate-700 pb-1">{tooltipData.year}</div>
                <div className="space-y-1">
                    {[
                        {k: "agriculture", l: "Agriculture", c: "#22c55e"},
                        {k: "manufacturing", l: "Industrie (Manuf)", c: "#3b82f6"},
                        {k: "construction", l: "Construction", c: "#eab308"},
                        {k: "trade", l: "Commerce/Hotels", c: "#f97316"},
                        {k: "transport", l: "Transport/Comm", c: "#a855f7"},
                        {k: "other", l: "Autres Services", c: "#64748b"},
                    ]
                    .map(item => ({...item, val: tooltipData[item.k]}))
                    .sort((a,b) => b.val - a.val) 
                    .map((item) => (
                        <div key={item.k} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{background: item.c}}></span>
                                <span className="text-slate-300">{item.l}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-white font-mono font-bold mr-2">{d3.format(".2s")(item.val)}</span>
                                <span className="text-slate-500 opacity-80">
                                    ({((item.val / tooltipData.totalValueAdded) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                        <span>TOTAL VA</span>
                        <span>{d3.format("$.3s")(tooltipData.totalValueAdded)}</span>
                    </div>
                </div>
            </div>
        )}

        {tooltipData && viewMode !== 'sectors' && viewMode !== 'trade' && (
             <div 
             className="absolute top-10 bg-slate-900/90 border border-blue-500/30 p-3 rounded-lg shadow-xl backdrop-blur text-sm pointer-events-none"
             style={{ left: cursorPosition > 300 ? cursorPosition - 150 : cursorPosition + 20 }}
         >
             <span className="text-slate-400 block text-xs uppercase tracking-wider">Année {tooltipData.year}</span>
             <span className="text-2xl font-bold text-white font-mono">
                 {viewMode === 'population' ? d3.format(",")(tooltipData.population) : d3.format("$.3s")(viewMode === 'wellbeing' ? tooltipData.householdConsumption : tooltipData.gdp)}
             </span>
             {tooltipData.isProjection && <span className="text-xs text-purple-400 block mt-1">✨ Projection (Estimé)</span>}
         </div>
        )}
    </div>
  );
};

export default InteractiveChart;