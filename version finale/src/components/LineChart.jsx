import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { formatCurrency, formatNumber, countryColors, calculateProjection, crisisYears } from '../utils/dataProcessing';
import Tooltip from './Tooltip';

const LineChart = ({
  datasets,
  metric = 'gdp',
  yLabel,
  showCrises = true,
  showProjection = true,
  formatValue = formatCurrency
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  useEffect(() => {
    if (!datasets || datasets.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const margin = { top: 20, right: 80, bottom: 30, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const defs = svg.append('defs');
    
    datasets.forEach((_, idx) => {
      const color = countryColors[idx % countryColors.length];
      const gradientId = `area-gradient-${idx}`;
      
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.3);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0);
    });

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allDataPoints = [];
    datasets.forEach(ds => {
      ds.data.forEach(d => allDataPoints.push(d));
      if (showProjection) {
        const proj = calculateProjection(ds.data, metric, 5);
        proj.forEach(d => allDataPoints.push(d));
      }
    });

    const x = d3.scaleLinear()
      .domain(d3.extent(allDataPoints, d => d.year))
      .range([0, w]);

    const yMax = d3.max(allDataPoints, d => d[metric]);
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.1]) 
      .range([h, 0]);

    g.selectAll('.grid-line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '0');

    if (showCrises) {
      crisisYears.forEach(crisis => {
        const x1 = x(crisis.start);
        const x2 = x(crisis.end);
        
        if (x2 > 0 && x1 < w) {
          g.append('rect')
            .attr('x', Math.max(0, x1))
            .attr('y', 0)
            .attr('width', Math.min(w, x2) - Math.max(0, x1))
            .attr('height', h)
            .attr('fill', crisis.color)
            .attr('opacity', 0.08);

          g.append('text')
            .attr('x', (Math.max(0, x1) + Math.min(w, x2)) / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('fill', crisis.color)
            .attr('font-size', '9px')
            .attr('font-weight', '600')
            .attr('opacity', 0.8)
            .text(crisis.label.toUpperCase());
        }
      });
    }

    const xAxis = d3.axisBottom(x)
      .tickFormat(d3.format('d'))
      .ticks(width < 600 ? 5 : 10)
      .tickSize(0)
      .tickPadding(10);

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .select('.domain').remove();

    g.selectAll('.tick text')
      .attr('fill', '#64748b')
      .attr('font-family', 'inherit')
      .attr('font-size', '11px');

    const yAxis = d3.axisLeft(y)
      .tickFormat(d => formatNumber(d))
      .ticks(5)
      .tickSize(0)
      .tickPadding(10);

    g.append('g')
      .call(yAxis)
      .select('.domain').remove();

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -h / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(yLabel);
    }

    const lineGenerator = d3.line()
      .defined(d => d[metric] !== null && !isNaN(d[metric]))
      .x(d => x(d.year))
      .y(d => y(d[metric]))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area()
      .defined(d => d[metric] !== null && !isNaN(d[metric]))
      .x(d => x(d.year))
      .y0(h)
      .y1(d => y(d[metric]))
      .curve(d3.curveMonotoneX);

    datasets.forEach((ds, idx) => {
      const color = countryColors[idx % countryColors.length];
      const realData = ds.data.filter(d => !d.isProjection);

      g.append('path')
        .datum(realData)
        .attr('fill', `url(#area-gradient-${idx})`)
        .attr('d', areaGenerator);

      g.append('path')
        .datum(realData)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .style('filter', `drop-shadow(0 0 4px ${color}80)`)
        .attr('d', lineGenerator);

      if (showProjection) {
        const proj = calculateProjection(ds.data, metric, 5);
        if (proj.length > 0) {
          const lastReal = realData[realData.length - 1];
          const projData = [lastReal, ...proj];
          
          g.append('path')
            .datum(projData)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0.6)
            .attr('d', lineGenerator);
        }
      }

      const lastPoint = realData[realData.length - 1];
      if (lastPoint && lastPoint[metric]) {
        g.append('circle')
            .attr('cx', x(lastPoint.year))
            .attr('cy', y(lastPoint[metric]))
            .attr('r', 4)
            .attr('fill', color);
            
        g.append('text')
          .attr('x', x(lastPoint.year) + 10)
          .attr('y', y(lastPoint[metric]))
          .attr('fill', color)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('alignment-baseline', 'middle')
          .text(ds.country);
      }
    });

    const overlay = g.append('rect')
      .attr('width', w).attr('height', h)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx));

        g.selectAll('.hover-line').remove();
        g.append('line')
          .attr('class', 'hover-line')
          .attr('x1', x(year)).attr('x2', x(year))
          .attr('y1', 0).attr('y2', h)
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.4);

        g.selectAll('.hover-circle').remove();
        const tooltipItems = [];

        datasets.forEach((ds, idx) => {
          let point = ds.data.find(d => d.year === year);
          let isProj = false;

          if (!point && showProjection) {
             const proj = calculateProjection(ds.data, metric, 5);
             point = proj.find(d => d.year === year);
             isProj = true;
          }

          if (point && point[metric] !== undefined) {
            const color = countryColors[idx % countryColors.length];
            
            g.append('circle')
              .attr('class', 'hover-circle')
              .attr('cx', x(year))
              .attr('cy', y(point[metric]))
              .attr('r', 6)
              .attr('fill', '#0f172a')
              .attr('stroke', color)
              .attr('stroke-width', 2);

            tooltipItems.push({
              label: ds.country + (isProj ? ' (Proj.)' : ''),
              value: formatValue(point[metric]),
              color: color
            });
          }
        });

        if (tooltipItems.length > 0) {
          setTooltip({ 
            title: `Année ${year}`, 
            items: tooltipItems 
          });
          setTooltipPos({ x: event.clientX, y: event.clientY });
        } else {
            setTooltip(null);
        }
      })
      .on('mouseleave', () => {
        g.selectAll('.hover-line').remove();
        g.selectAll('.hover-circle').remove();
        setTooltip(null);
      });

  }, [datasets, metric, showCrises, showProjection, yLabel, formatValue]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[350px] relative font-sans">
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
      <Tooltip data={tooltip} position={tooltipPos} />
    </div>
  );
};

export default LineChart;