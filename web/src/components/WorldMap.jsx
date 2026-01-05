import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const WorldMap = ({ data, selectedCountries, onCountryClick, isMini = false }) => {
  const svgRef = useRef();
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(data => setGeoData(data));
  }, []);

  useEffect(() => {
    if (!geoData) return;

    const width = isMini ? 300 : window.innerWidth * 0.8;
    const height = isMini ? 180 : window.innerHeight * 0.8;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl.attr("width", width).attr("height", height);

    
    const projection = d3.geoMercator()
      .scale(isMini ? 40 : 120)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append("g");

    
    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        
        const name = d.properties.name;
        if (selectedCountries.includes(name) || 
           (name === "USA" && selectedCountries.includes("United States of America")) ||
           (name === "England" && selectedCountries.includes("United Kingdom"))) {
            return "#3b82f6"; 
        }
        return isMini ? "#334155" : "#1e293b"; 
      })
      .attr("stroke", isMini ? "none" : "#475569")
      .style("cursor", isMini ? "default" : "pointer")
      .on("click", (event, d) => {
        if (!isMini && onCountryClick) {
            
            let name = d.properties.name;
            if(name === "USA") name = "United States of America";
            if(name === "England") name = "United Kingdom";
            onCountryClick(name);
        }
      })
      .append("title").text(d => d.properties.name); 

    
    if (!isMini) {
        const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (e) => g.attr("transform", e.transform));
        svg.call(zoom);
    }

  }, [geoData, selectedCountries, isMini]);

  return (
    <div className={`rounded-xl overflow-hidden ${isMini ? 'opacity-80' : 'bg-slate-900 border border-slate-700 shadow-2xl'}`}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default WorldMap;