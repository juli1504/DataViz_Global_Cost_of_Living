
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateProjection } from '../utils/dataProcessing';

const UniversalChart = ({ 
  datasets,         
  viewMode,         
  showCrises, 
  showProjection 
}) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [tooltip, setTooltip] = useState(null);

  
  const colors = ["#3b82f6", "#ef4444", "#10b981", "#eab308", "#a855f7"];

  useEffect(() => {
    if (!datasets || datasets.length === 0) return;

    
    const wrapper = wrapperRef.current;
    const { width, height } = wrapper.getBoundingClientRect();
    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); 

    const svg = svgEl
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    
    
    let chartData = datasets.map(ds => {
      let fullData = [...ds.data];
      const supportsProjection = ['growth', 'population', 'wellbeing'].includes(viewMode);
      
      if (showProjection && supportsProjection) {
         
         const metric = viewMode === 'population' ? 'population' : (viewMode === 'wellbeing' ? 'householdConsumption' : 'gdp');
         const proj = calculateProjection(ds.data, metric, 5);
         fullData = [...fullData, ...proj];
      }
      return { ...ds, data: fullData };
    });


    

    
    
    
    if (viewMode === 'trade') {
        let tradeSeries = [];

        if (datasets.length === 1) {
            
            const ds = datasets[0];
            tradeSeries = [
                { label: "Exportations", metricKey: "exports", data: ds.data, color: "#22c55e" }, 
                { label: "Importations", metricKey: "imports", data: ds.data, color: "#f97316" }  
            ];
        } else {
            
            tradeSeries = datasets.map((ds, i) => ({
                label: ds.country,
                isBalance: true,
                data: ds.data,
                color: colors[i % colors.length]
            }));
        }

        const allPoints = tradeSeries.flatMap(s => s.data);
        const x = d3.scaleLinear().domain(d3.extent(allPoints, d => d.year)).range([0, chartWidth]);
        
        
        let yMin, yMax;
        if (datasets.length === 1) {
            yMin = 0;
            yMax = d3.max(allPoints, d => Math.max(d.imports, d.exports));
        } else {
            
            const balances = allPoints.map(d => d.exports - d.imports);
            yMin = d3.min(balances);
            yMax = d3.max(balances);
            
            if (yMin > 0) yMin = 0;
        }

        const y = d3.scaleLinear().domain([yMin, yMax * 1.1]).range([chartHeight, 0]);

        
        svg.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        
        if (yMin < 0) {
            svg.append("line")
               .attr("x1", 0).attr("x2", chartWidth)
               .attr("y1", y(0)).attr("y2", y(0))
               .attr("stroke", "white").attr("opacity", 0.5).attr("stroke-dasharray", "2,2");
        }

        
        const lineGen = (accessor) => d3.line()
            .defined(d => !isNaN(accessor(d)))
            .curve(d3.curveMonotoneX)
            .x(d => x(d.year))
            .y(d => y(accessor(d)));

        tradeSeries.forEach(s => {
            const valueAccessor = s.isBalance 
                ? (d) => d.exports - d.imports
                : (d) => d[s.metricKey];

            svg.append("path")
               .datum(s.data)
               .attr("fill", "none")
               .attr("stroke", s.color)
               .attr("stroke-width", 2.5)
               .attr("d", lineGen(valueAccessor));
        });

        
        addTooltipInteraction(svg, x, chartWidth, chartHeight, (year) => {
            if (datasets.length === 1) {
                const d = datasets[0].data.find(i => i.year === year);
                if (!d) return null;
                const bal = d.exports - d.imports;
                return [
                    { label: "Export", value: d3.format("$.2s")(d.exports), color: "#22c55e" },
                    { label: "Import", value: d3.format("$.2s")(d.imports), color: "#f97316" },
                    { label: "Balance", value: d3.format("$.2s")(bal), color: bal >= 0 ? "#22c55e" : "#ef4444" }
                ];
            } else {
                return tradeSeries.map(s => {
                    const d = s.data.find(i => i.year === year);
                    if (!d) return null;
                    const bal = d.exports - d.imports;
                    return { label: s.label, value: d3.format("$.2s")(bal), color: s.color };
                }).filter(Boolean).sort((a,b) => parseFloat(b.value) - parseFloat(a.value));
            }
        });

        if (showCrises) drawCrises(svg, x, chartHeight);
    }

    
    
    
    else if (viewMode === 'population' && datasets.length === 1) {
        const data = chartData[0].data;
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, chartWidth]);
        
        
        const yGdp = d3.scaleLinear().domain([0, d3.max(data, d => d.gdp)]).range([chartHeight, 0]);
        
        const minPop = d3.min(data, d => d.population);
        const maxPop = d3.max(data, d => d.population);
        const yPop = d3.scaleLinear().domain([minPop * 0.95, maxPop * 1.05]).range([chartHeight, 0]);

        
        svg.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        
        svg.append("g").call(d3.axisLeft(yGdp).tickFormat(d3.format(".2s"))).attr("color", "#3b82f6");
        svg.append("text").attr("y", -10).text("PIB ($)").attr("fill", "#3b82f6").style("font-size", "10px");

        svg.append("g").attr("transform", `translate(${chartWidth},0)`).call(d3.axisRight(yPop).tickFormat(d3.format(".2s"))).attr("color", "#ef4444");
        svg.append("text").attr("x", chartWidth).attr("y", -10).attr("text-anchor", "end").text("Population").attr("fill", "#ef4444").style("font-size", "10px");

        
        const lineGdp = d3.line().defined(d => !isNaN(d.gdp)).x(d => x(d.year)).y(d => yGdp(d.gdp));
        const linePop = d3.line().defined(d => !isNaN(d.population)).x(d => x(d.year)).y(d => yPop(d.population));

        
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#3b82f6").attr("stroke-width", 2.5).attr("d", lineGdp);
        
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#ef4444").attr("stroke-width", 2.5).attr("d", linePop);

        if (showCrises) drawCrises(svg, x, chartHeight);

        
        addTooltipInteraction(svg, x, chartWidth, chartHeight, (year) => {
            const d = data.find(i => i.year === year);
            if (!d) return null;
            return [
                { label: "PIB", value: d3.format("$.2s")(d.gdp), color: "#3b82f6", isProj: d.isProjection },
                { label: "Population", value: d3.format(".2s")(d.population), color: "#ef4444", isProj: d.isProjection }
            ];
        });
    }

    
    
    
    else if (viewMode === 'sectors' && datasets.length === 1) {
        const data = chartData[0].data;
        const keys = ["agriculture", "manufacturing", "construction", "trade", "transport", "other"];
        const labels = { agriculture: "Agri", manufacturing: "Indus", construction: "Constr", trade: "Comm", transport: "Transp", other: "Serv" };
        const colorScale = d3.scaleOrdinal().domain(keys).range(["#22c55e", "#3b82f6", "#eab308", "#f97316", "#a855f7", "#64748b"]);

        const stacked = d3.stack().keys(keys)(data);
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, chartWidth]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.totalValueAdded)]).range([chartHeight, 0]);

        svg.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        
        svg.selectAll("path.layer")
           .data(stacked)
           .enter().append("path")
           .attr("class", "layer")
           .attr("fill", d => colorScale(d.key))
           .attr("d", d3.area().x(d => x(d.data.year)).y0(d => y(d[0])).y1(d => y(d[1])))
           .attr("opacity", 0.85)
           .attr("stroke", "rgba(255,255,255,0.2)");

        if (showCrises) drawCrises(svg, x, chartHeight);

        
        addTooltipInteraction(svg, x, chartWidth, chartHeight, (year) => {
            const d = data.find(i => i.year === year);
            if (!d) return null;
            return keys.map(k => ({
                label: labels[k],
                value: `${d3.format(".2s")(d[k])} (${((d[k] / d.totalValueAdded) * 100).toFixed(1)}%)`,
                color: colorScale(k)
            })).reverse();
        });
    }

    
    
    
    else {
        
        let metric = 'gdp';
        if (viewMode === 'wellbeing') metric = 'householdConsumption';
        if (viewMode === 'population') metric = 'population';

        const allPoints = chartData.flatMap(d => d.data);
        const x = d3.scaleLinear().domain(d3.extent(allPoints, d => d.year)).range([0, chartWidth]);
        const y = d3.scaleLinear().domain([0, d3.max(allPoints, d => d[metric]) * 1.1]).range([chartHeight, 0]);

        svg.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        const line = d3.line().defined(d => !isNaN(d[metric])).curve(d3.curveMonotoneX).x(d => x(d.year)).y(d => y(d[metric]));

        chartData.forEach((ds, i) => {
            const color = colors[i % colors.length];
            
            
            svg.append("path")
               .datum(ds.data.filter(d => !d.isProjection))
               .attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.5)
               .attr("d", line);

            
            if (showProjection) {
                
                const projData = ds.data.filter(d => d.isProjection || d.year === ds.data[ds.data.length - 6]?.year);
                svg.append("path")
                   .datum(projData)
                   .attr("fill", "none").attr("stroke", color).attr("stroke-width", 2)
                   .attr("stroke-dasharray", "4,4")
                   .attr("d", line);
            }
        });

        if (showCrises) drawCrises(svg, x, chartHeight);

        
        addTooltipInteraction(svg, x, chartWidth, chartHeight, (year) => {
            return chartData.map((ds, i) => {
                const d = ds.data.find(it => it.year === year);
                return d ? {
                    label: ds.country,
                    value: d3.format(viewMode === 'population' ? ".3s" : "$.2s")(d[metric]),
                    color: colors[i % colors.length],
                    isProj: d.isProjection
                } : null;
            }).filter(Boolean).sort((a,b) => parseFloat(b.value.replace(/[$,s]/g,'')) - parseFloat(a.value.replace(/[$,s]/g,''))); 
        });
    }

    

    
    function drawCrises(container, xScale, h) {
        const crises = [{ y: 2009, label: "Crise 2008" }, { y: 2020, label: "COVID" }];
        crises.forEach(c => {
            const xPos = xScale(c.y);
            if (xPos > 0 && xPos < chartWidth) {
                container.append("line")
                    .attr("x1", xPos).attr("x2", xPos)
                    .attr("y1", 0).attr("y2", h)
                    .attr("stroke", "#ef4444").attr("stroke-width", 1)
                    .attr("stroke-dasharray", "4,2").attr("opacity", 0.6);
                
                container.append("text")
                    .attr("x", xPos).attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#ef4444")
                    .style("font-size", "9px").style("font-weight", "bold")
                    .text(c.label);
            }
        });
    }

    
    function addTooltipInteraction(container, xScale, w, h, getDataCallback) {
        
        container.append("rect")
            .attr("width", w).attr("height", h)
            .attr("fill", "transparent")
            .on("mousemove", (event) => {
                const [mx] = d3.pointer(event);
                const year = Math.round(xScale.invert(mx));
                
                
                container.selectAll(".cursor-line").remove();
                container.append("line").attr("class", "cursor-line")
                    .attr("x1", xScale(year)).attr("x2", xScale(year))
                    .attr("y1", 0).attr("y2", h)
                    .attr("stroke", "white").attr("opacity", 0.4);

                const data = getDataCallback(year);
                
                
                
                if (data) {
                    setTooltip({
                        x: event.pageX + 15,
                        y: event.pageY + 15,
                        title: `Année ${year}`,
                        items: data
                    });
                } else {
                    setTooltip(null);
                }
            })
            .on("mouseleave", () => {
                container.selectAll(".cursor-line").remove();
                setTooltip(null);
            });
    }

  }, [datasets, viewMode, showCrises, showProjection]);


  
  return (
    <div ref={wrapperRef} className="w-full h-full relative cursor-crosshair">
      <svg ref={svgRef} className="overflow-visible block"></svg>
      
      {tooltip && (
        <div 
           className="fixed z-[9999] bg-slate-900/95 border border-slate-600 p-3 rounded-lg shadow-2xl pointer-events-none min-w-[160px] backdrop-blur-sm"
           style={{ left: tooltip.x, top: tooltip.y }}
        >
            <div className="font-bold text-white text-sm border-b border-slate-700 mb-2 pb-1 text-center">
                {tooltip.title}
            </div>
            {tooltip.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs mb-1 gap-3">
                    <div className="flex items-center gap-2">
                        {item.color && <span className="w-2 h-2 rounded-full" style={{background: item.color}}></span>}
                        <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <span className="text-white font-mono font-bold">
                        {item.value} {item.isProj ? '*' : ''}
                    </span>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default UniversalChart;