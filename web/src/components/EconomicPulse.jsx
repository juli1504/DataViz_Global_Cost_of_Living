import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sectorConfig, sectorKeys, formatCurrency, formatNumber } from '../utils/dataProcessing';
import Tooltip from './Tooltip';

const EconomicPulse = ({ data, year, country }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const yearData = data.find(d => d.year === year) || data[data.length - 1];
    if (!yearData) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2 - 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const minDim = Math.min(width, height);
    
    const centerRadius = Math.min(75, minDim * 0.15);

    const minR = Math.max(centerRadius + 40, Math.min(200, minDim * 0.25));

    const safeMargin = 75; 
    const maxR = (minDim / 2) - safeMargin;

    const safeMaxR = Math.max(maxR, minR + 20);

    const defs = svg.append('defs');
    const centerGrad = defs.append('radialGradient').attr('id', 'pulse-center-grad');
    centerGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4');
    centerGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1e1b4b');

    const fixedAngles = {
      agriculture: -Math.PI / 2,     
      manufacturing: -Math.PI / 6,   
      construction: Math.PI / 6,     
      other: Math.PI / 2,            
      trade: 5 * Math.PI / 6,        
      transport: -5 * Math.PI / 6    
    };

    sectorKeys.forEach(key => {
      const grad = defs.append('linearGradient').attr('id', `pulse-grad-${key}`).attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', cx).attr('y1', cy).attr('x2', cx).attr('y2', cy);
      grad.append('stop').attr('offset', '0%').attr('stop-color', sectorConfig[key].color).attr('stop-opacity', 0.8);
      grad.append('stop').attr('offset', '100%').attr('stop-color', sectorConfig[key].color).attr('stop-opacity', 0.1);
    });

    const total = sectorKeys.reduce((sum, k) => sum + (yearData[k] || 0), 0);
    const maxVal = Math.max(...sectorKeys.map(k => yearData[k] || 0));

    const bgGroup = svg.append('g');
    [1, 0.8].forEach((ratio) => {
      const r = safeMaxR * ratio;
      if (r > minR) {
        bgGroup.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', `rgba(100, 200, 255, ${0.05})`).attr('stroke-dasharray', '4,4');
      }
    });

    const flowGroup = svg.append('g');
    
    sectorKeys.forEach((sector, i) => {
      const val = yearData[sector] || 0;
      if (val === 0) return;

      const angle = fixedAngles[sector];
      
      let r = minR + (maxVal > 0 ? (val / maxVal) * (safeMaxR - minR) : 0);
      
      if (sector === 'other') r -= Math.min(30, (safeMaxR - minR) * 0.3);

      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      const ctrlX = cx + Math.cos(angle) * (minR * 0.4);
      const ctrlY = cy + Math.sin(angle) * (minR * 0.4);

      svg.select(`#pulse-grad-${sector}`).attr('x2', x).attr('y2', y);

      const path = flowGroup.append('path')
        .attr('d', `M${cx},${cy} Q${ctrlX},${ctrlY} ${x},${y}`)
        .attr('fill', 'none')
        .attr('stroke', `url(#pulse-grad-${sector})`)
        .attr('stroke-width', Math.max(3, (val / total) * 15))
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.6);

      const len = path.node().getTotalLength();
      path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
        .transition().duration(1200).delay(i * 100).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);
    });

    const exports = yearData.exports || 0;
    const imports = yearData.imports || 0;
    const tradeTotal = exports + imports;
    const balance = exports - imports;

    if (tradeTotal > 0) {
      const boxWidth = 260;
      const boxHeight = 160;
      const boxX = width - boxWidth - 10;
      const boxY = height - boxHeight - 10;

      const tradeBox = svg.append('g').attr('transform', `translate(${boxX},${boxY})`);

      tradeBox.append('rect').attr('width', boxWidth).attr('height', boxHeight).attr('rx', 12).attr('fill', 'rgba(15, 23, 42, 0.85)').attr('stroke', 'rgba(77, 208, 225, 0.2)').attr('stroke-width', 1).style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))');
      tradeBox.append('text').attr('x', boxWidth / 2).attr('y', 25).attr('text-anchor', 'middle').attr('fill', '#4dd0e1').attr('font-size', '13px').attr('font-weight', 'bold').text('COMMERCE INTERNATIONAL');

      const exportPercent = (exports / tradeTotal) * 100;
      const importPercent = (imports / tradeTotal) * 100;
      const barY = 45;
      const barHeight = 20;
      const barMargin = 15;
      const barWidth = boxWidth - 2 * barMargin;

      tradeBox.append('rect').attr('x', barMargin).attr('y', barY).attr('width', barWidth).attr('height', barHeight).attr('rx', 4).attr('fill', 'rgba(255,255,255,0.05)');
      const exportBarW = (barWidth * exportPercent) / 100;
      tradeBox.append('rect').attr('x', barMargin).attr('y', barY).attr('width', 0).attr('height', barHeight).attr('rx', 4).attr('fill', '#22c55e').transition().duration(1000).ease(d3.easeCubicOut).attr('width', exportBarW);
      const importBarW = (barWidth * importPercent) / 100;
      tradeBox.append('rect').attr('x', barMargin + exportBarW).attr('y', barY).attr('width', 0).attr('height', barHeight).attr('rx', 4).attr('fill', '#f97316').transition().duration(1000).delay(200).ease(d3.easeCubicOut).attr('width', importBarW);

      if (exportPercent > 2 && importPercent > 2) {
        tradeBox.append('line').attr('x1', barMargin + exportBarW).attr('x2', barMargin + exportBarW).attr('y1', barY).attr('y2', barY + barHeight).attr('stroke', '#0f172a').attr('stroke-width', 2);
      }

      const detailsY = 90;
      const lineH = 20;
      const expG = tradeBox.append('g');
      expG.append('circle').attr('cx', 25).attr('cy', detailsY).attr('r', 4).attr('fill', '#22c55e');
      expG.append('text').attr('x', 35).attr('y', detailsY + 4).attr('fill', '#94a3b8').attr('font-size', '11px').text('Exports');
      expG.append('text').attr('x', boxWidth - 15).attr('y', detailsY + 4).attr('text-anchor', 'end').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', 'bold').text(formatNumber(exports));

      const impG = tradeBox.append('g');
      impG.append('circle').attr('cx', 25).attr('cy', detailsY + lineH).attr('r', 4).attr('fill', '#f97316');
      impG.append('text').attr('x', 35).attr('y', detailsY + lineH + 4).attr('fill', '#94a3b8').attr('font-size', '11px').text('Imports');
      impG.append('text').attr('x', boxWidth - 15).attr('y', detailsY + lineH + 4).attr('text-anchor', 'end').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', 'bold').text(formatNumber(imports));

      tradeBox.append('line').attr('x1', barMargin).attr('x2', boxWidth - barMargin).attr('y1', detailsY + lineH + 12).attr('y2', detailsY + lineH + 12).attr('stroke', 'rgba(255,255,255,0.1)');

      const balanceY = detailsY + lineH * 2 + 10;
      const balColor = balance >= 0 ? '#22c55e' : '#ef4444';
      const balLabel = balance >= 0 ? 'Excédent' : 'Déficit';
      
      tradeBox.append('text').attr('x', barMargin).attr('y', balanceY + 4).attr('fill', '#aaa').attr('font-size', '11px').text('Balance :');
      
      const balG = tradeBox.append('g');
      const balanceText = balG.append('text').attr('x', boxWidth - 15).attr('y', balanceY + 4).attr('text-anchor', 'end').attr('fill', balColor).attr('font-size', '12px').attr('font-weight', 'bold').text(`${balLabel} (${formatNumber(Math.abs(balance))})`);

      let textWidth = 0;
      try { textWidth = balanceText.node().getComputedTextLength(); } catch(e) { textWidth = 80; }
      const arrowX = (boxWidth - 15) - textWidth - 12;

      if (balance >= 0) {
        tradeBox.append('path').attr('d', `M${arrowX},${balanceY + 2} L${arrowX + 4},${balanceY - 2} L${arrowX + 8},${balanceY + 2}`).attr('stroke', balColor).attr('stroke-width', 1.5).attr('fill', 'none');
      } else {
        tradeBox.append('path').attr('d', `M${arrowX},${balanceY - 2} L${arrowX + 4},${balanceY + 2} L${arrowX + 8},${balanceY - 2}`).attr('stroke', balColor).attr('stroke-width', 1.5).attr('fill', 'none');
      }
    }

    const nodesGroup = svg.append('g');
    sectorKeys.forEach((sector) => {
      const val = yearData[sector] || 0;
      if (val === 0) return;

      const angle = fixedAngles[sector];
      
      let r = minR + (maxVal > 0 ? (val / maxVal) * (safeMaxR - minR) : 0);
      
      if (sector === 'other') r -= Math.min(30, (safeMaxR - minR) * 0.3);

      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      const nodeR = Math.min(25, 12 + (total > 0 ? (val / total) * 20 : 0));

      const g = nodesGroup.append('g').attr('transform', `translate(${x},${y})`).style('cursor', 'pointer');
      g.append('circle').attr('r', nodeR + 5).attr('fill', sectorConfig[sector].color).attr('opacity', 0.15);
      g.append('circle').attr('r', nodeR).attr('fill', '#0B0F19').attr('stroke', sectorConfig[sector].color).attr('stroke-width', 2);
      g.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', nodeR * 0.6).text(sectorConfig[sector].icon);

      const labelBg = g.append('rect').attr('rx', 4).attr('fill', '#0B0F19').attr('stroke', '#334155').attr('stroke-width', 1).attr('opacity', 0.9);
      const labelText = g.append('text').attr('y', nodeR + 15).attr('text-anchor', 'middle').attr('fill', '#e2e8f0').attr('font-size', '10px').attr('font-weight', '600').text(sectorConfig[sector].label);
      try { const bbox = labelText.node().getBBox(); labelBg.attr('x', bbox.x - 4).attr('y', bbox.y - 2).attr('width', bbox.width + 8).attr('height', bbox.height + 4); } catch(e) {}
      g.append('text').attr('y', nodeR + 28).attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', '9px').text(`${((val / total) * 100).toFixed(1)}%`);

      g.on('mouseenter', (e) => {
        g.select('circle:nth-child(2)').transition().attr('transform', 'scale(1.15)');
        setTooltip({ title: sectorConfig[sector].label, items: [{ label: 'Valeur', value: formatCurrency(val), color: sectorConfig[sector].color }, { label: 'Part', value: `${((val / total) * 100).toFixed(1)}%` }] });
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }).on('mouseleave', () => {
        g.select('circle:nth-child(2)').transition().attr('transform', 'scale(1)');
        setTooltip(null);
      });
    });

    const centerGroup = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    
    const pulseCircle = centerGroup.append('circle').attr('r', centerRadius + 5).attr('fill', 'none').attr('stroke', '#06b6d4').attr('opacity', 0.5);
    function animatePulse() { pulseCircle.transition().duration(2000).attr('r', centerRadius + 20).attr('opacity', 0).transition().duration(0).attr('r', centerRadius + 5).attr('opacity', 0.5).on('end', animatePulse); }
    animatePulse();
    
    centerGroup.append('circle').attr('r', centerRadius).attr('fill', 'url(#pulse-center-grad)').attr('stroke', '#06b6d4').attr('stroke-width', 3).style('filter', 'drop-shadow(0 0 15px rgba(6,182,212,0.4))');
    centerGroup.append('text').attr('text-anchor', 'middle').attr('y', -centerRadius * 0.3).attr('fill', 'white').attr('font-size', '12px').attr('opacity', 0.8).text('PIB Total');
    centerGroup.append('text').attr('text-anchor', 'middle').attr('y', centerRadius * 0.15).attr('fill', 'white').attr('font-size', '16px').attr('font-weight', '900').text(formatCurrency(yearData.gdp));
    centerGroup.append('text').attr('text-anchor', 'middle').attr('y', centerRadius * 0.45).attr('fill', '#94a3b8').attr('font-size', '11px').attr('font-family', 'monospace').text(yearData.year);

  }, [data, year]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full block" />
      <Tooltip data={tooltip} position={tooltipPos} />
    </div>
  );
};

export default EconomicPulse;