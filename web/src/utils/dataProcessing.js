import * as d3 from 'd3';

// Couleurs
export const sectorConfig = {
  agriculture: { color: '#22c55e', label: 'Agriculture', icon: '🌾' },
  manufacturing: { color: '#3b82f6', label: 'Industrie', icon: '🏭' },
  construction: { color: '#eab308', label: 'Construction', icon: '🏗️' },
  trade: { color: '#f97316', label: 'Commerce', icon: '🛒' },
  transport: { color: '#a855f7', label: 'Transport', icon: '🚛' },
  other: { color: '#64748b', label: 'Services', icon: '📊' }
};

export const sectorKeys = Object.keys(sectorConfig);
export const countryColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

// Formatage
export const formatNumber = (n) => {
  if (n === null || n === undefined || isNaN(n)) return 'N/A';
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
};

export const formatCurrency = (n) => '$' + formatNumber(n);

export const formatPopulation = (n) => {
  if (n === null || n === undefined || isNaN(n)) return 'N/A';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' milliards';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' millions';
  return n.toLocaleString('fr-FR');
};

// Traitement CSV
export const processData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  return rawData.map(d => {
    const clean = {};
    Object.keys(d).forEach(key => {
      clean[key.trim()] = d[key];
    });

    let country = (clean['Country'] || '').trim();
    
    // Mapping des noms
    const countryMap = {
      'United States': 'United States of America',
      'Russian Federation': 'Russia',
      'Korea, Republic of': 'South Korea',
      'Viet Nam': 'Vietnam',
      'Iran, Islamic Republic of': 'Iran',
      'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom'
    };
    country = countryMap[country] || country;

    const parseNum = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    return {
      country,
      year: parseInt(clean['Year']) || 0,
      gdp: parseNum(clean['Gross Domestic Product (GDP)']),
      gni: parseNum(clean['Gross National Income(GNI) in USD']),
      gniPerCapita: parseNum(clean['Per capita GNI']),
      population: parseNum(clean['Population']),
      currency: (clean['Currency'] || '').trim(),
      exports: parseNum(clean['Exports of goods and services']),
      imports: parseNum(clean['Imports of goods and services']),
      householdConsumption: parseNum(clean['Household consumption expenditure (including Non-profit institutions serving households)']),
      governmentConsumption: parseNum(clean['General government final consumption expenditure']),
      agriculture: parseNum(clean['Agriculture, hunting, forestry, fishing (ISIC A-B)']),
      manufacturing: parseNum(clean['Manufacturing (ISIC D)']),
      construction: parseNum(clean['Construction (ISIC F)']),
      trade: parseNum(clean['Wholesale, retail trade, restaurants and hotels (ISIC G-H)']),
      transport: parseNum(clean['Transport, storage and communication (ISIC I)']),
      other: parseNum(clean['Other Activities (ISIC J-P)']),
      totalValueAdded: parseNum(clean['Total Value Added']),
    };
  })
  .filter(d => d.year > 0 && d.country && d.gdp > 0)
  .sort((a, b) => a.year - b.year);
};

// Projection
export const calculateProjection = (data, metric, years = 5) => {
  if (!data || data.length < 3) return [];
  
  const recent = data.slice(-10);
  const n = recent.length;
  
  const sumX = recent.reduce((s, d) => s + d.year, 0);
  const sumY = recent.reduce((s, d) => s + (d[metric] || 0), 0);
  const sumXY = recent.reduce((s, d) => s + d.year * (d[metric] || 0), 0);
  const sumXX = recent.reduce((s, d) => s + d.year * d.year, 0);
  
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return [];
  
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  
  const lastYear = data[data.length - 1].year;
  
  return Array.from({ length: years }, (_, i) => {
    const yr = lastYear + i + 1;
    return {
      year: yr,
      [metric]: Math.max(0, slope * yr + intercept),
      isProjection: true
    };
  });
};

// Crises
export const crisisYears = [
  { start: 1973, end: 1974, label: 'Choc Pétrolier', color: '#f59e0b' },
  { start: 2000, end: 2001, label: 'Bulle Internet', color: '#8b5cf6' },
  { start: 2008, end: 2009, label: 'Crise Financière', color: '#ef4444' },
  { start: 2020, end: 2021, label: 'COVID-19', color: '#f97316' }
];
