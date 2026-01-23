import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { countryColors } from '../utils/dataProcessing';

const WorldMap = ({ 
  selectedCountries = [], 
  availableCountries = [],
  onCountryClick, 
  mini = false 
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [geoData, setGeoData] = useState(null);
  const [hovered, setHovered] = useState(null);

  const nameMap = {
    'The Bahamas': 'Bahamas',
    'Bolivia': 'Bolivia (Plurinational State of)',
    'Brunei': 'Brunei Darussalam',
    'Ivory Coast': "Côte d'Ivoire",
    'Republic of the Congo': 'Congo',
    'Democratic Republic of the Congo': 'D.R. of the Congo',
    'Czech Republic': 'Czechia',
    'England': 'United Kingdom',
    'Guinea Bissau': 'Guinea-Bissau',
    'Iran': 'Iran (Islamic Republic of)',
    'South Korea': 'Republic of Korea',
    'North Korea': 'D.P.R. of Korea',
    'Laos': "Lao People's DR",
    'Moldova': 'Republic of Moldova',
    'Macedonia': 'North Macedonia',
    'Republic of Serbia': 'Serbia',
    'Swaziland': 'Eswatini',
    'Syria': 'Syrian Arab Republic',
    'East Timor': 'Timor-Leste',
    'Turkey': 'Türkiye',
    'United Republic of Tanzania': 'U.R. of Tanzania: Mainland',
    'USA': 'United States of America',
    'Venezuela': 'Venezuela (Bolivarian Republic of)',
    'West Bank': 'State of Palestine'

  };

  const getCSVName = (geoName) => {
    if (availableCountries.includes(geoName)) return geoName;
    if (nameMap[geoName] && availableCountries.includes(nameMap[geoName])) return nameMap[geoName];
    const mapped = Object.keys(nameMap).find(key => nameMap[key] === geoName);
    if (mapped && availableCountries.includes(mapped)) return mapped;
    return null;
  };

  useEffect(() => {
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(setGeoData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!geoData || !containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height)
       .style('background-color', '#0B0F19')
       .style('cursor', 'grab');

    const projection = d3.geoMercator()
      .scale(mini ? width / 6 : width / 5.5)
      .center([10, 35])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append('g');

    g.append('rect')
      .attr('width', width * 10)
      .attr('height', height * 10)
      .attr('x', -width * 5)
      .attr('y', -height * 5)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all');

    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const geoName = d.properties.name;
        const csvName = getCSVName(geoName);
        if (!csvName) return '#1e293b'; 
        const idx = selectedCountries.indexOf(csvName);
        if (idx >= 0) return countryColors[idx % countryColors.length];
        return mini ? '#334155' : '#475569';
      })
      .attr('stroke', mini ? 'rgba(255,255,255,0.1)' : '#1e293b')
      .attr('stroke-width', mini ? 0.5 : 1)
      .style('cursor', d => getCSVName(d.properties.name) ? 'pointer' : 'default')
      .on('mouseenter', function(event, d) {
        const csvName = getCSVName(d.properties.name);
        if (!csvName) return;
        if (!selectedCountries.includes(csvName)) {
           d3.select(this).attr('fill', '#64748b');
        }
        setHovered(csvName);
      })
      .on('mouseleave', function(event, d) {
        const csvName = getCSVName(d.properties.name);
        if (!csvName) return;
        const idx = selectedCountries.indexOf(csvName);
        d3.select(this).attr('fill', idx >= 0 ? countryColors[idx % countryColors.length] : (mini ? '#334155' : '#475569'));
        setHovered(null);
      })
      .on('click', (event, d) => {
        const csvName = getCSVName(d.properties.name);
        if (csvName && onCountryClick) {
          onCountryClick(csvName);
        }
      });

    if (!mini) {
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[-width, -height], [width * 2, height * 2]])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      
      svg.call(zoom);
      
      svg.on('mousedown.zoom', () => svg.style('cursor', 'grabbing'));
      svg.on('mouseup.zoom', () => svg.style('cursor', 'grab'));
    }

  }, [geoData, selectedCountries, availableCountries, mini, onCountryClick]);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${mini ? 'w-full h-full' : 'w-full h-full min-h-[400px]'}`}
    >
      <svg ref={svgRef} className="w-full h-full block" />
      
      {hovered && !mini && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full text-sm shadow-xl z-10 pointer-events-none">
          <span className="text-white font-bold">{hovered}</span>
          {selectedCountries.includes(hovered) && <span className="ml-2 text-cyan-400">✓</span>}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
