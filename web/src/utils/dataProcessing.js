export const processData = (rawData) => {
    if (!rawData) return [];
  
    return rawData.map(d => {
      // Nettoyage clé/valeur
      const cleanRow = {};
      Object.keys(d).forEach(key => {
        cleanRow[key.trim()] = typeof d[key] === 'string' ? d[key].trim() : d[key];
      });
  
      // Correction des noms de pays pour matcher la carte ou les habitudes
      let countryName = cleanRow["Country"];
      if (countryName === "United States") countryName = "United States of America";
      if (countryName === "Korea, Republic of") countryName = "South Korea";
      if (countryName === "China") countryName = "China"; // Juste pour être sûr
      if (countryName === "Russian Federation") countryName = "Russia";
  
      return {
        country: countryName,
        year: +cleanRow["Year"],
        gdp: +cleanRow["Gross Domestic Product (GDP)"] || 0,
        gni: +cleanRow["Gross National Income(GNI) in USD"] || 0,
        population: +cleanRow["Population"] || 0,
        householdConsumption: +cleanRow["Household consumption expenditure (including Non-profit institutions serving households)"] || 0,
        exports: +cleanRow["Exports of goods and services"] || 0,
        imports: +cleanRow["Imports of goods and services"] || 0,
        agriculture: +cleanRow["Agriculture, hunting, forestry, fishing (ISIC A-B)"] || 0,
        manufacturing: +cleanRow["Manufacturing (ISIC D)"] || 0,
        construction: +cleanRow["Construction (ISIC F)"] || 0,
        trade: +cleanRow["Wholesale, retail trade, restaurants and hotels (ISIC G-H)"] || 0,
        transport: +cleanRow["Transport, storage and communication (ISIC I)"] || 0,
        other: +cleanRow["Other Activities (ISIC J-P)"] || 0,
        totalValueAdded: +cleanRow["Total Value Added"] || 0,
      };
    })
    .filter(d => d.year && d.country && d.gdp > 0) // On garde que les lignes valides
    .sort((a, b) => a.year - b.year);
  };
  
  // Fonction bonus pour la régression linéaire (inchangée)
  export const calculateProjection = (data, key, yearsToProject = 5) => {
    if (!data || data.length < 5) return [];
    
    const recentData = data.slice(-10); // Basé sur les 10 dernières années dispo
    const n = recentData.length;
    if (n === 0) return [];
  
    const sumX = recentData.reduce((acc, d) => acc + d.year, 0);
    const sumY = recentData.reduce((acc, d) => acc + d[key], 0);
    const sumXY = recentData.reduce((acc, d) => acc + (d.year * d[key]), 0);
    const sumXX = recentData.reduce((acc, d) => acc + (d.year * d.year), 0);
  
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
  
    const lastYear = data[data.length - 1].year;
    const projections = [];
  
    for (let i = 1; i <= yearsToProject; i++) {
      const projYear = lastYear + i;
      projections.push({
        year: projYear,
        [key]: slope * projYear + intercept,
        isProjection: true
      });
    }
    return projections;
  };