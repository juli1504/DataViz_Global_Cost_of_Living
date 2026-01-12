import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { formatCurrency, formatNumber, countryColors, crisisYears, calculateProjection } from '../utils/dataProcessing';
import Tooltip from './Tooltip';

const TradeChart = ({ datasets, showCrises = true, showProjection = false }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  useEffect(() => {
    if (!datasets || datasets.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0) return;

    const margin = { top: 20, right: 80, bottom: 30, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    let allYears = datasets.flatMap(ds => ds.data.map(d => d.year));
    if (showProjection) {
        const maxYear = Math.max(...allYears);
        for(let i=1; i<=5; i++) allYears.push(maxYear + i);
    }

    const x = d3.scaleLinear()
      .domain(d3.extent(allYears))
      .range([0, w]);

    const isSingle = datasets.length === 1;

    if (isSingle) {
      const data = datasets[0].data;

      const yMax = d3.max(data, d => Math.max(d.exports || 0, d.imports || 0));
      const y = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([h, 0]);

      g.selectAll('.grid-line').data(y.ticks(5)).enter().append('line')
        .attr('x1', 0).attr('x2', w).attr('y1', d => y(d)).attr('y2', d => y(d))
        .attr('stroke', 'rgba(255,255,255,0.05)');

      if (showCrises) {
        crisisYears.forEach(crisis => {
          const x1 = x(crisis.start);
          const x2 = x(crisis.end);
          if (x1 < w && x2 > 0) {
            g.append('rect')
              .attr('x', x1).attr('y', 0)
              .attr('width', x2 - x1).attr('height', h)
              .attr('fill', crisis.color).attr('opacity', 0.1);
            
            g.append('text')
              .attr('x', (x1 + x2) / 2)
              .attr('y', 15)
              .attr('text-anchor', 'middle')
              .attr('fill', crisis.color)
              .attr('font-size', '9px')
              .attr('font-weight', 'bold')
              .attr('opacity', 0.8)
              .text(crisis.label.toUpperCase());
          }
        });
      }

      g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d3.format('d')).tickSize(0).tickPadding(10)).select('.domain').remove();
      g.append('g').call(d3.axisLeft(y).tickFormat(d => formatNumber(d)).tickSize(0).tickPadding(10)).select('.domain').remove();
      g.selectAll('.tick text').attr('fill', '#64748b');

      const drawLine = (metric, color) => {
          const line = d3.line().defined(d => d[metric] != null).x(d => x(d.year)).y(d => y(d[metric])).curve(d3.curveMonotoneX);
          
          g.append('path').datum(data).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 3).attr('d', line);

          if (showProjection) {
              const proj = calculateProjection(data, metric, 5);
              if (proj.length > 0) {
                  const lastReal = data[data.length - 1];
                  const projData = [lastReal, ...proj];
                  g.append('path').datum(projData).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('stroke-dasharray', '4,4').attr('opacity', 0.6).attr('d', line);
                  const end = proj[proj.length-1];
                  g.append('circle').attr('cx', x(end.year)).attr('cy', y(end[metric])).attr('r', 3).attr('fill', color).attr('opacity', 0.6);
              }
          }
      };

      drawLine('exports', '#22c55e');
      drawLine('imports', '#f97316');

      const lastPoint = data[data.length - 1];
      g.append('text').attr('x', x(lastPoint.year) + 5).attr('y', y(lastPoint.exports)).attr('fill', '#22c55e').attr('font-size', '12px').attr('font-weight', 'bold').text('Exp.');
      g.append('text').attr('x', x(lastPoint.year) + 5).attr('y', y(lastPoint.imports)).attr('fill', '#f97316').attr('font-size', '12px').attr('font-weight', 'bold').text('Imp.');

      g.append('rect').attr('width', w).attr('height', h).attr('fill', 'transparent').style('cursor', 'crosshair')
        .on('mousemove', (event) => {
          const [mx] = d3.pointer(event);
          const year = Math.round(x.invert(mx));
          let point = data.find(d => d.year === year);
          let isProj = false;
          
          if (!point && showProjection) {
              const projExp = calculateProjection(data, 'exports', 5).find(d => d.year === year);
              const projImp = calculateProjection(data, 'imports', 5).find(d => d.year === year);
              if (projExp && projImp) {
                  point = { year, exports: projExp.exports, imports: projImp.imports };
                  isProj = true;
              }
          }

          if (point) {
            const balance = (point.exports || 0) - (point.imports || 0);
            g.selectAll('.hover-line').remove();
            g.append('line').attr('class', 'hover-line').attr('x1', x(year)).attr('x2', x(year)).attr('y1', 0).attr('y2', h).attr('stroke', 'white').attr('stroke-dasharray', '3,3').attr('opacity', 0.3);

            setTooltip({
              title: `Année ${year} ${isProj ? '(Proj.)' : ''}`,
              items: [
                { label: 'Exports', value: formatCurrency(point.exports), color: '#22c55e' },
                { label: 'Imports', value: formatCurrency(point.imports), color: '#f97316' },
                { label: 'Balance', value: formatCurrency(balance), color: balance >= 0 ? '#22c55e' : '#ef4444' }
              ]
            });
            setTooltipPos({ x: event.clientX, y: event.clientY });
          }
        })
        .on('mouseleave', () => { g.selectAll('.hover-line').remove(); setTooltip(null); });

    } else {
      
      const balanceDatasets = datasets.map(ds => {
          const balanceData = ds.data.map(d => ({ year: d.year, balance: (d.exports || 0) - (d.imports || 0) }));
          return { ...ds, balanceData };
      });

      const allBalances = balanceDatasets.flatMap(ds => ds.balanceData.map(d => d.balance));
      const yMin = Math.min(0, d3.min(allBalances));
      const yMax = d3.max(allBalances);

      const y = d3.scaleLinear()
        .domain([yMin * 1.1, yMax * 1.1])
        .range([h, 0]);

      g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#64748b').attr('stroke-dasharray', '4,4');

      if (showCrises) {
        crisisYears.forEach(crisis => {
          const x1 = x(crisis.start);
          const x2 = x(crisis.end);
          if (x1 < w && x2 > 0) {
            g.append('rect')
              .attr('x', x1).attr('y', 0)
              .attr('width', x2 - x1).attr('height', h)
              .attr('fill', crisis.color).attr('opacity', 0.1);
            
            g.append('text')
              .attr('x', (x1 + x2) / 2)
              .attr('y', 15)
              .attr('text-anchor', 'middle')
              .attr('fill', crisis.color)
              .attr('font-size', '9px')
              .attr('font-weight', 'bold')
              .attr('opacity', 0.8)
              .text(crisis.label.toUpperCase());
          }
        });
      }

      g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d3.format('d')).tickSize(0)).select('.domain').remove();
      g.append('g').call(d3.axisLeft(y).tickFormat(d => formatNumber(d)).tickSize(0)).select('.domain').remove();
      g.selectAll('.tick text').attr('fill', '#64748b');

      const line = d3.line().x(d => x(d.year)).y(d => y(d.balance)).curve(d3.curveMonotoneX);

      balanceDatasets.forEach((ds, idx) => {
        const color = countryColors[idx % countryColors.length];
        g.append('path').datum(ds.balanceData).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5).attr('d', line);

        if (showProjection) {
            const proj = calculateProjection(ds.balanceData, 'balance', 5);
            if (proj.length > 0) {
                const lastReal = ds.balanceData[ds.balanceData.length - 1];
                const projData = [lastReal, ...proj];
                g.append('path').datum(projData).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('stroke-dasharray', '4,4').attr('opacity', 0.6).attr('d', line);
            }
        }
        const last = ds.balanceData[ds.balanceData.length - 1];
        g.append('text').attr('x', x(last.year) + 5).attr('y', y(last.balance)).attr('fill', color).attr('font-size', '11px').attr('font-weight', 'bold').text(ds.country);
      });

      g.append('rect').attr('width', w).attr('height', h).attr('fill', 'transparent').style('cursor', 'crosshair')
        .on('mousemove', (event) => {
          const [mx] = d3.pointer(event);
          const year = Math.round(x.invert(mx));
          g.selectAll('.hover-line').remove();
          g.append('line').attr('class', 'hover-line').attr('x1', x(year)).attr('x2', x(year)).attr('y1', 0).attr('y2', h).attr('stroke', 'white').attr('stroke-dasharray', '3,3').attr('opacity', 0.3);

          const items = balanceDatasets.map((ds, idx) => {
            let point = ds.balanceData.find(d => d.year === year);
            let isProj = false;
            if (!point && showProjection) {
                const proj = calculateProjection(ds.balanceData, 'balance', 5).find(d => d.year === year);
                if (proj) { point = proj; isProj = true; }
            }
            if (!point) return null;
            return {
              label: ds.country + (isProj ? '*' : ''),
              value: formatCurrency(point.balance),
              color: countryColors[idx % countryColors.length]
            };
          }).filter(Boolean);

          if (items.length > 0) {
            setTooltip({ title: `Balance ${year}`, items });
            setTooltipPos({ x: event.clientX, y: event.clientY });
          }
        })
        .on('mouseleave', () => { g.selectAll('.hover-line').remove(); setTooltip(null); });
    }

  }, [datasets, showCrises, showProjection]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] relative">
      <svg ref={svgRef} className="w-full h-full block" />
      <Tooltip data={tooltip} position={tooltipPos} />
    </div>
  );
};

export default TradeChart;