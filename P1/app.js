
// --- CONFIGURATION ---
const sectorColors = {
  agriculture: '#81c784',
  manufacturing: '#64b5f6',
  construction: '#ffb74d',
  trade: '#ce93d8',
  transport: '#4dd0e1',
  other: '#ff8a65'
};

const sectorLabels = {
  agriculture: 'Agriculture & Pêche',
  manufacturing: 'Industrie (ISIC D)',
  construction: 'Construction',
  trade: 'Commerce & Tourisme',
  transport: 'Transport & Comm.',
  other: 'Autres Activités'
};

// Variables globales
let globalData = [];
let currentCountry = '';
let currentYear = 2021;

// --- FORMATAGE ---
const formatNumber = (n) => {
  if (!n || isNaN(n)) return 'N/A';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T$';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' Mrd$';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M$';
  return n.toLocaleString('fr-FR');
};

const formatPop = (n) => {
  if (!n || isNaN(n)) return 'N/A';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' Mrd';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' M';
  return n.toLocaleString('fr-FR');
};

// --- CHARGEMENT DES DONNÉES (CSV DÉJÀ NETTOYÉ) ---
d3.csv("Global_Economy_Cleaned.csv", d => ({
  country: d.country,
  year: +d.year,
  gdp: +d.gdp,
  gni: +d.gni,
  pop: +d.pop,
  currency: d.currency,
  exchange: +d.exchange,
  agriculture: +d.agriculture,
  manufacturing: +d.manufacturing,
  construction: +d.construction,
  trade: +d.trade,
  transport: +d.transport,
  other: +d.other,
  exports: +d.exports,
  imports: +d.imports
}))
.then(data => {

  globalData = data;
  console.log("Données chargées :", globalData.length);

  // Pays
  const countries = [...new Set(globalData.map(d => d.country))].sort();
  const countrySelect = d3.select('#country-select');

  countrySelect.selectAll('option')
    .data(countries)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  // Années
  const years = globalData.map(d => d.year);
  const minYear = d3.min(years);
  const maxYear = d3.max(years);

  const slider = document.getElementById('year-slider');
  slider.min = minYear;
  slider.max = maxYear;
  slider.value = maxYear;
  currentYear = maxYear;

  // Pays par défaut
  if (countries.includes("United States")) currentCountry = "United States";
  else if (countries.includes("France")) currentCountry = "France";
  else currentCountry = countries[0];

  countrySelect.property('value', currentCountry);

  // Affichage
  document.getElementById('loading').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  update();

  // Événements
  countrySelect.on('change', function () {
    currentCountry = this.value;
    update();
  });

  slider.addEventListener('input', function () {
    currentYear = +this.value;
    document.getElementById('year-display').textContent = currentYear;
    update();
  });

})
.catch(error => {
  console.error(error);
  document.getElementById('loading').innerHTML =
    "Erreur de chargement du fichier Global_Economy_Cleaned.csv";
});


// --- RÉCUPÉRATION DES DONNÉES ---
function getDataForYear(country, year) {
  const countryData = globalData.filter(d => d.country === country);

  const exact = countryData.find(d => d.year === year);
  if (exact) return exact;

  const closest = countryData.reduce((prev, curr) =>
    Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
  );

  return closest || {};
}


// --- DESSIN : LE PULSE (RADIAL) ---
function drawPulse(data) {
  const svg = d3.select('#pulse-svg');
  svg.selectAll('*').remove();
  
  if(!data.country) return;

  const w = svg.node().getBoundingClientRect().width;
  const h = 500;
  const cx = w / 2, cy = h / 2;
  
  const defs = svg.append('defs');
  const grad = defs.append('radialGradient').attr('id', 'centerGrad');
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#4dd0e1');
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#1a237e');
  
  Object.entries(sectorColors).forEach(([k, c]) => {
    const g = defs.append('linearGradient').attr('id', `grad-${k}`).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    g.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', 0.8);
    g.append('stop').attr('offset', '100%').attr('stop-color', c).attr('stop-opacity', 0.3);
  });

  const sectors = ['agriculture', 'manufacturing', 'construction', 'trade', 'transport', 'other'];
  const total = sectors.reduce((s, k) => s + (data[k] || 0), 0);
  const maxVal = Math.max(...sectors.map(k => data[k] || 0));
  const minR = 80, maxR = Math.min(w, h) / 2 - 60;
  
  // Cercles de fond
  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', maxR + 20).attr('fill', 'none').attr('stroke', 'rgba(100,150,255,0.1)').attr('stroke-width', 1);
  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', maxR / 2).attr('fill', 'none').attr('stroke', 'rgba(100,150,255,0.05)').attr('stroke-width', 1);

  const angleStep = (2 * Math.PI) / sectors.length;
  const tooltip = d3.select('#tooltip');
  
  // Lignes de flux
  const flowG = svg.append('g').attr('class', 'flow-lines');
  sectors.forEach((sector, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = data[sector] || 0;
    // Eviter division par zéro
    const r = maxVal > 0 ? minR + (val / maxVal) * (maxR - minR) : minR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    
    if(val > 0) {
        const path = flowG.append('path')
          .attr('d', `M${cx},${cy} Q${cx + Math.cos(angle) * r/2 + 20},${cy + Math.sin(angle) * r/2 - 20} ${x},${y}`)
          .attr('fill', 'none')
          .attr('stroke', `url(#grad-${sector})`)
          .attr('stroke-width', Math.max(2, (val / total) * 30))
          .attr('opacity', 0.6);
        
        const len = path.node().getTotalLength();
        path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
          .transition().duration(1500).delay(i * 100).attr('stroke-dashoffset', 0);
    }
  });

  // Noeuds des secteurs
  const nodesG = svg.append('g');
  sectors.forEach((sector, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = data[sector] || 0;
    const r = maxVal > 0 ? minR + (val / maxVal) * (maxR - minR) : minR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const nodeR = total > 0 ? 15 + (val / total) * 40 : 10;
    
    const g = nodesG.append('g').attr('transform', `translate(${x},${y})`).style('cursor', 'pointer');
    
    // Effet Pulse
    g.append('circle').attr('r', nodeR).attr('fill', sectorColors[sector]).attr('opacity', 0.3)
      .append('animate').attr('attributeName', 'r').attr('values', `${nodeR};${nodeR + 10};${nodeR}`).attr('dur', '2s').attr('repeatCount', 'indefinite');
    
    g.append('circle').attr('r', nodeR).attr('fill', sectorColors[sector]).attr('opacity', 0.8)
      .attr('stroke', '#fff').attr('stroke-width', 2);
    
    g.append('text').attr('class', 'node-label').attr('y', nodeR + 18).text(sectorLabels[sector].split(' ')[0]);
    
    g.on('mouseover', function(event) {
      d3.select(this).select('circle:last-of-type').transition().duration(200).attr('r', nodeR * 1.2);
      tooltip.style('opacity', 1).html(`<strong>${sectorLabels[sector]}</strong><br>${formatNumber(val)}<br>${total > 0 ? ((val/total)*100).toFixed(1) : 0}% du total`)
        .style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this).select('circle:last-of-type').transition().duration(200).attr('r', nodeR);
      tooltip.style('opacity', 0);
    });
  });

  // Centre (PIB)
  const gdpR = 60;
  const centerG = svg.append('g').attr('transform', `translate(${cx},${cy})`);
  centerG.append('circle').attr('r', gdpR + 5).attr('fill', 'none').attr('stroke', '#4dd0e1').attr('stroke-width', 2).attr('opacity', 0.5)
    .append('animate').attr('attributeName', 'r').attr('values', `${gdpR + 5};${gdpR + 15};${gdpR + 5}`).attr('dur', '3s').attr('repeatCount', 'indefinite');
  centerG.append('circle').attr('r', gdpR).attr('fill', 'url(#centerGrad)');
  centerG.append('text').attr('class', 'center-value').attr('y', -8).text('PIB');
  centerG.append('text').attr('class', 'center-value').attr('y', 12).attr('font-size', '12px').text(formatNumber(data.gdp));

  // SECTION IMPORTS/EXPORTS - Boîte en bas à droite
  drawTradeBox(data, svg, w, h);
}

// --- BOÎTE IMPORTS/EXPORTS ---
function drawTradeBox(data, svg, svgWidth, svgHeight) {
  const boxWidth = 280;
  const boxHeight = 180;
  const boxX = svgWidth - boxWidth - 20;
  const boxY = svgHeight - boxHeight - 20;
  
  const exports = data.exports || 0;
  const imports = data.imports || 0;
  const balance = exports - imports;
  const total = exports + imports;
  
  // Groupe de la boîte
  const tradeBox = svg.append('g')
    .attr('class', 'trade-box')
    .attr('transform', `translate(${boxX},${boxY})`);
  
  // Fond avec effet glassmorphism
  tradeBox.append('rect')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('rx', 12)
    .attr('fill', 'rgba(26, 26, 58, 0.85)')
    .attr('stroke', 'rgba(77, 208, 225, 0.3)')
    .attr('stroke-width', 2);
  
  // Titre
  tradeBox.append('text')
    .attr('x', boxWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', '#4dd0e1')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text('Commerce International');
  
  // Si pas de données
  if (total === 0) {
    tradeBox.append('text')
      .attr('x', boxWidth / 2)
      .attr('y', boxHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '12px')
      .text('Données non disponibles');
    return;
  }
  
  // Calcul des pourcentages
  const exportPercent = (exports / total) * 100;
  const importPercent = (imports / total) * 100;
  
  // Barre de ratio
  const barY = 50;
  const barHeight = 30;
  const barMargin = 15;
  
  // Fond de la barre
  tradeBox.append('rect')
    .attr('x', barMargin)
    .attr('y', barY)
    .attr('width', boxWidth - 2 * barMargin)
    .attr('height', barHeight)
    .attr('rx', 5)
    .attr('fill', 'rgba(0,0,0,0.3)');
  
  // Barre exports (vert)
  const exportWidth = ((boxWidth - 2 * barMargin) * exportPercent) / 100;
  tradeBox.append('rect')
    .attr('x', barMargin)
    .attr('y', barY)
    .attr('width', 0)
    .attr('height', barHeight)
    .attr('rx', 5)
    .attr('fill', '#81c784')
    .transition()
    .duration(1000)
    .attr('width', exportWidth);
  
  // Barre imports (orange)
  const importWidth = ((boxWidth - 2 * barMargin) * importPercent) / 100;
  tradeBox.append('rect')
    .attr('x', barMargin + exportWidth)
    .attr('y', barY)
    .attr('width', 0)
    .attr('height', barHeight)
    .attr('rx', 5)
    .attr('fill', '#ff8a65')
    .transition()
    .duration(1000)
    .delay(200)
    .attr('width', importWidth);
  
  // Ligne de séparation
  if (exportPercent > 5 && importPercent > 5) {
    tradeBox.append('line')
      .attr('x1', barMargin + exportWidth)
      .attr('x2', barMargin + exportWidth)
      .attr('y1', barY)
      .attr('y2', barY + barHeight)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5);
  }
  
  // Valeurs détaillées
  const detailsY = 95;
  const lineSpacing = 22;
  
  // Exports
  const exportG = tradeBox.append('g');
  exportG.append('circle')
    .attr('cx', 25)
    .attr('cy', detailsY)
    .attr('r', 6)
    .attr('fill', '#81c784');
  exportG.append('text')
    .attr('x', 38)
    .attr('y', detailsY + 4)
    .attr('fill', '#ccc')
    .attr('font-size', '12px')
    .text('Exports');
  exportG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', detailsY + 4)
    .attr('text-anchor', 'end')
    .attr('fill', '#81c784')
    .attr('font-size', '13px')
    .attr('font-weight', 'bold')
    .text(formatNumber(exports));
  exportG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', detailsY + 16)
    .attr('text-anchor', 'end')
    .attr('fill', '#81c784')
    .attr('font-size', '10px')
    .attr('opacity', 0.7)
    .text(`${exportPercent.toFixed(1)}%`);
  
  // Imports
  const importG = tradeBox.append('g');
  importG.append('circle')
    .attr('cx', 25)
    .attr('cy', detailsY + lineSpacing)
    .attr('r', 6)
    .attr('fill', '#ff8a65');
  importG.append('text')
    .attr('x', 38)
    .attr('y', detailsY + lineSpacing + 4)
    .attr('fill', '#ccc')
    .attr('font-size', '12px')
    .text('Imports');
  importG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', detailsY + lineSpacing + 4)
    .attr('text-anchor', 'end')
    .attr('fill', '#ff8a65')
    .attr('font-size', '13px')
    .attr('font-weight', 'bold')
    .text(formatNumber(imports));
  importG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', detailsY + lineSpacing + 16)
    .attr('text-anchor', 'end')
    .attr('fill', '#ff8a65')
    .attr('font-size', '10px')
    .attr('opacity', 0.7)
    .text(`${importPercent.toFixed(1)}%`);
  
  // Ligne de séparation
  tradeBox.append('line')
    .attr('x1', barMargin)
    .attr('x2', boxWidth - barMargin)
    .attr('y1', detailsY + lineSpacing * 2 - 5)
    .attr('y2', detailsY + lineSpacing * 2 - 5)
    .attr('stroke', 'rgba(255,255,255,0.1)')
    .attr('stroke-width', 1);
  
  // Balance commerciale
  const balanceY = detailsY + lineSpacing * 2 + 15;
  const balanceColor = balance >= 0 ? '#81c784' : '#ef5350';
  const balanceLabel = balance >= 0 ? 'Excédent' : 'Déficit';
  
  tradeBox.append('text')
    .attr('x', barMargin)
    .attr('y', balanceY)
    .attr('fill', '#aaa')
    .attr('font-size', '11px')
    .text('Balance Commerciale');
  
  const balanceG = tradeBox.append('g');
  balanceG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', balanceY)
    .attr('text-anchor', 'end')
    .attr('fill', balanceColor)
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text(formatNumber(Math.abs(balance)));
  
  balanceG.append('text')
    .attr('x', boxWidth - 15)
    .attr('y', balanceY + 14)
    .attr('text-anchor', 'end')
    .attr('fill', balanceColor)
    .attr('font-size', '10px')
    .attr('opacity', 0.8)
    .text(balanceLabel);
  
  // Icône indicateur
  const iconX = barMargin * 10.5;
  const iconY = balanceY - 8;
  if (balance >= 0) {
    // Flèche vers le haut
    tradeBox.append('path')
      .attr('d', `M${iconX},${iconY + 5} L${iconX + 5},${iconY} L${iconX + 10},${iconY + 5}`)
      .attr('fill', 'none')
      .attr('stroke', balanceColor)
      .attr('stroke-width', 2);
  } else {
    // Flèche vers le bas
    tradeBox.append('path')
      .attr('d', `M${iconX},${iconY} L${iconX + 5},${iconY + 5} L${iconX + 10},${iconY}`)
      .attr('fill', 'none')
      .attr('stroke', balanceColor)
      .attr('stroke-width', 2);
  }
}

// --- DESSIN : TIMELINE ---
function drawTimeline(country) {
  const svg = d3.select('#timeline-chart');
  svg.selectAll('*').remove();
  const rect = svg.node().getBoundingClientRect();
  const w = rect.width, h = 200;
  const m = {top: 20, right: 30, bottom: 30, left: 60};
  
  const countryData = globalData.filter(d => d.country === country).sort((a,b) => a.year - b.year);
  if (countryData.length < 2) return;
  
  const x = d3.scaleLinear().domain(d3.extent(countryData, d => d.year)).range([m.left, w - m.right]);
  const y = d3.scaleLinear().domain([0, d3.max(countryData, d => d.gdp) * 1.1]).range([h - m.bottom, m.top]);
  
  const area = d3.area().x(d => x(d.year)).y0(h - m.bottom).y1(d => y(d.gdp)).curve(d3.curveMonotoneX);
  const line = d3.line().x(d => x(d.year)).y(d => y(d.gdp)).curve(d3.curveMonotoneX);
  
  const grad = svg.append('defs').append('linearGradient').attr('id', 'areaGrad').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#4dd0e1').attr('stop-opacity', 0.4);
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#4dd0e1').attr('stop-opacity', 0);
  
  svg.append('path').datum(countryData).attr('fill', 'url(#areaGrad)').attr('d', area);
  svg.append('path').datum(countryData).attr('fill', 'none').attr('stroke', '#4dd0e1').attr('stroke-width', 3).attr('d', line);
  
  svg.selectAll('.dot').data(countryData).enter().append('circle')
    .attr('cx', d => x(d.year)).attr('cy', d => y(d.gdp)).attr('r', 3).attr('fill', '#4dd0e1').attr('stroke', '#fff').attr('stroke-width', 1).attr('opacity', 0.6);
  
  // Axes
  svg.append('g').attr('transform', `translate(0,${h - m.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(5)).selectAll('text').attr('fill', '#888');
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d => d3.format(".2s")(d))).selectAll('text').attr('fill', '#888');
  svg.selectAll('.domain, .tick line').attr('stroke', '#444');
  
  // Ligne de l'année actuelle
  if(x(currentYear) >= m.left && x(currentYear) <= w - m.right) {
      svg.append('line').attr('x1', x(currentYear)).attr('x2', x(currentYear)).attr('y1', m.top).attr('y2', h - m.bottom)
        .attr('stroke', '#ce93d8').attr('stroke-width', 2).attr('stroke-dasharray', '5,5');
  }
}

// --- DESSIN : SECTEURS (CAMEMBERT) ---
function drawSectors(data) {
  const svg = d3.select('#sectors-chart');
  svg.selectAll('*').remove();
  const rect = svg.node().getBoundingClientRect();
  const w = rect.width, h = 200;
  const r = Math.min(w, h) / 2 - 20;
  const cx = w / 2, cy = h / 2;
  
  const sectors = ['agriculture', 'manufacturing', 'construction', 'trade', 'transport', 'other'];
  const pieData = sectors.map(s => ({name: s, value: data[s] || 0})).filter(d => d.value > 0);
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const tooltip = d3.select('#tooltip');
  
  if(total === 0) {
      svg.append("text").attr("x", cx).attr("y", cy).attr("text-anchor", "middle").attr("fill", "#aaa").text("Pas de données sectorielles");
      return;
  }

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(r * 0.5).outerRadius(r);
  const arcHover = d3.arc().innerRadius(r * 0.5).outerRadius(r + 10);
  
  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
  
  const arcs = g.selectAll('.arc').data(pie(pieData)).enter().append('g').attr('class', 'arc');
  
  arcs.append('path').attr('d', arc).attr('fill', d => sectorColors[d.data.name]).attr('stroke', '#1a1a3a').attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this).transition().duration(200).attr('d', arcHover);
      tooltip.style('opacity', 1).html(`<strong>${sectorLabels[d.data.name]}</strong><br>${formatNumber(d.data.value)}<br>${((d.data.value/total)*100).toFixed(1)}%`)
        .style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this).transition().duration(200).attr('d', arc);
      tooltip.style('opacity', 0);
    });
  
  // Legend
  const legend = d3.select('#sectors-legend');
  legend.selectAll('*').remove();
  sectors.forEach(s => {
    if((data[s] || 0) > 0) {
        const item = legend.append('div').attr('class', 'legend-item');
        item.append('div').attr('class', 'legend-dot').style('background', sectorColors[s]);
        item.append('span').text(sectorLabels[s]);
    }
  });
}

// --- MISE A JOUR UI ---
function updateStats(data) {
  document.getElementById('display-country').textContent = data.country || currentCountry;
  document.getElementById('display-currency').textContent = data.currency ? `Monnaie: ${data.currency}` : '';
  document.getElementById('stat-gdp').textContent = formatNumber(data.gdp);
  document.getElementById('stat-gni').textContent = formatNumber(data.gni);
  document.getElementById('stat-pop').textContent = formatPop(data.pop);
  document.getElementById('stat-exchange').textContent = (data.exchange && data.exchange > 0) ? data.exchange.toFixed(4) : '-';
}

function update() {
  const data = getDataForYear(currentCountry, currentYear);

  drawPulse(data);
  drawTimeline(currentCountry);
  drawSectors(data);
  updateStats(data);
}

// Responsive
window.addEventListener('resize', update);
