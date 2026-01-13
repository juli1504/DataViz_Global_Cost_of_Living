import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sectorConfig, sectorKeys, formatCurrency } from '../utils/dataProcessing';
import Tooltip from './Tooltip';

const PieChart = ({ data, year }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const margin = 20;
    
    const radius = Math.min(width, height) / 2 - margin;
    
    if (radius <= 0) return;

    const cx = width / 2;
    const cy = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const yearData = data.find(d => d.year === year) || data[data.length - 1];
    if (!yearData) return;

    const pieData = sectorKeys
      .map(key => ({
        key,
        value: yearData[key] || 0,
        color: sectorConfig[key].color,
        label: sectorConfig[key].label,
        icon: sectorConfig[key].icon
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = pieData.reduce((sum, d) => sum + d.value, 0);

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.02);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 10);

    g.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(200).attr('d', arcHover);
        setTooltip({
          title: d.data.label,
          items: [
            { icon: d.data.icon, label: 'Valeur', value: formatCurrency(d.data.value), color: d.data.color },
            { label: 'Part', value: `${((d.data.value / total) * 100).toFixed(1)}%` }
          ]
        });
        setTooltipPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(200).attr('d', arc);
        setTooltip(null);
      });

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -8)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('TOTAL');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 14)
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(formatCurrency(total));

  }, [data, year, dimensions]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      <div ref={containerRef} className="flex-1 w-full min-h-0 relative">
        <svg ref={svgRef} className="w-full h-full block" />
        <Tooltip data={tooltip} position={tooltipPos} />
      </div>
      
      <div className="flex-none flex flex-wrap justify-center gap-x-4 gap-y-2 py-2 px-2 border-t border-white/5 bg-slate-900/20">
        {sectorKeys.map(key => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sectorConfig[key].color }} />
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{sectorConfig[key].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
