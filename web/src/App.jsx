import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { processData } from './utils/dataProcessing';
import UniversalChart from './components/UniversalChart';
import WorldMap from './components/WorldMap';

const App = () => {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(["France", "United States of America"]);
  const [viewMode, setViewMode] = useState('growth');
  const [showCrises, setShowCrises] = useState(true);
  const [showProjection, setShowProjection] = useState(true);
  
  const [legendData, setLegendData] = useState(null);

  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (viewMode === 'sectors' && selectedCountries.length > 1) {
      setSelectedCountries([selectedCountries[0]]);
    }
  }, [viewMode]);

  useEffect(() => {
    d3.csv('economy.csv').then(raw => {
      const processed = processData(raw);
      setData(processed);
      setCountries([...new Set(processed.map(d => d.country))].sort());
    });
  }, []);

  const toggleCountry = (c) => {
    if (viewMode === 'sectors') {
        if (selectedCountries.includes(c) && selectedCountries.length === 1) {
            return; // Ne pas permettre de désélectionner le seul pays en mode secteurs
        }
        setSelectedCountries([c]);
        return;
    }
    if (selectedCountries.includes(c)) {
      if (selectedCountries.length > 1) setSelectedCountries(selectedCountries.filter(x => x !== c));
    } else {
      if (selectedCountries.length < 5) setSelectedCountries([...selectedCountries, c]);
      else alert("Max 5 pays");
    }
  };

  const datasets = selectedCountries.map(c => ({ country: c, data: data.filter(d => d.country === c) }));

  
  const getDesc = () => {
      if(viewMode === 'trade') return datasets.length === 1 ? "Evolution des Importations (Orange) et Exportations (Vert). L'écart représente la balance commerciale." : "Comparaison du Solde Commercial (Export - Import). Au dessus de 0 = Excédent.";
      if(viewMode === 'population') return "Analyse Démographique : Comparez la courbe de population avec celle du PIB (Double Axe si 1 pays).";
      return "Analyse Macroéconomique : Survolez le graphique pour voir les valeurs exactes.";
  };

  // Fonction pour obtenir les données de légende en fonction du mode
  const getLegendItems = () => {
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#eab308", "#a855f7"];
    
    if (viewMode === 'trade') {
      if (datasets.length === 1) {
        return [
          { label: "Exportations", color: "#22c55e" },
          { label: "Importations", color: "#f97316" },
        ];
      } else {
        return datasets.map((ds, i) => ({
          label: ds.country,
          color: colors[i % colors.length]
        }));
      }
    }
    
    if (viewMode === 'sectors' && datasets.length === 1) {
      const keys = ["agriculture", "manufacturing", "construction", "trade", "transport", "other"];
      const labels = { 
        agriculture: "Agriculture", 
        manufacturing: "Industrie", 
        construction: "Construction", 
        trade: "Commerce", 
        transport: "Transport", 
        other: "Services" 
      };
      const colorScale = {
        agriculture: "#22c55e",
        manufacturing: "#3b82f6",
        construction: "#eab308",
        trade: "#f97316",
        transport: "#a855f7",
        other: "#64748b"
      };
      
      return keys.map(k => ({
        label: labels[k],
        color: colorScale[k]
      }));
    }
    
    if (viewMode === 'population' && datasets.length === 1) {
      return [
        { label: "PIB", color: "#3b82f6" },
        { label: "Population", color: "#ef4444" }
      ];
    }
    
    // Modes growth, wellbeing, population (multi-pays)
    return datasets.map((ds, i) => ({
      label: ds.country,
      color: colors[i % colors.length]
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-20">
         <div className="font-bold text-xl flex items-center gap-2"><span className="text-blue-500 text-2xl">⚡</span> DataViz</div>
         
         <div className="flex items-center gap-4">
             {/* Dropdown Fallback */}
             <select className="bg-slate-800 border border-slate-700 text-sm p-1 rounded" onChange={(e) => toggleCountry(e.target.value)} value="">
                 <option value="" disabled>🔍 Ajouter pays (Liste)</option>
                 {countries.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             
             {/* Liste Pays */}
             <div className="flex gap-2">
                 {selectedCountries.map(c => (
                     <span key={c} className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                         {c} <button onClick={() => toggleCountry(c)} className="hover:text-red-400 font-bold">×</button>
                     </span>
                 ))}
             </div>
         </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="flex flex-1 overflow-hidden relative">
          
          {/* NAVIGATION */}
          <nav className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-10">
              {[
                  {id: 'growth', i: '📈'}, {id: 'trade', i: '⚖️'}, 
                  {id: 'population', i: '👥'}, {id: 'sectors', i: '🏭'}, {id: 'wellbeing', i: '🛒'}
              ].map(t => (
                  <button 
                    key={t.id} onClick={() => setViewMode(t.id)}
                    className={`p-3 rounded-xl text-xl transition-all ${viewMode === t.id ? 'bg-blue-600 shadow-lg scale-110' : 'text-slate-500 hover:bg-slate-800'}`}
                  >
                      {t.i}
                  </button>
              ))}
          </nav>

          {/* MAIN CHART */}
          <main className="flex-1 p-6 flex flex-col relative">
              <div className="flex justify-between items-end mb-4">
                  <div>
                      <h1 className="text-2xl font-bold capitalize">{viewMode === 'trade' ? 'Commerce International' : viewMode}</h1>
                      <p className="text-slate-400 text-sm">{getDesc()}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showCrises} onChange={() => setShowCrises(!showCrises)} className="accent-red-500"/> Crises</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showProjection} onChange={() => setShowProjection(!showProjection)} className="accent-purple-500"/> Projections</label>
                  </div>
              </div>

              <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-inner relative">
                  {datasets.length > 0 ? (
                      <UniversalChart datasets={datasets} viewMode={viewMode} showCrises={showCrises} showProjection={showProjection} onLegendUpdate={setLegendData} />
                  ) : <div className="h-full flex items-center justify-center text-slate-500">Aucun pays sélectionné</div>}
              </div>
          </main>
          
          {/* --- LEGEND FIXE --- */}
          <div className="absolute top-23 right-6 bg-slate-900/95 border border-slate-700 rounded-lg p-4 shadow-xl backdrop-blur-sm min-w-[200px] max-w-[280px]">
            <div className="font-bold text-white text-sm border-b border-slate-700 mb-3 pb-2">
              📊 Légende
            </div>
            
            <div className="space-y-2">
              {getLegendItems().map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 text-xs"
                >
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{background: item.color}}
                  ></span>
                  <span className="text-slate-300 truncate">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Afficher les données dynamiques au survol */}
            {legendData && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">
                  {legendData.title}
                </div>
                <div className="space-y-1">
                  {legendData.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{background: item.color}}
                          ></span>
                        )}
                        <span className="text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- MINIMAP (BOTTOM RIGHT) --- */}
          <div 
             className="absolute bottom-6 right-6 z-30 transition-transform hover:scale-105 cursor-pointer shadow-2xl border-2 border-slate-700 rounded-xl overflow-hidden bg-slate-900"
             onClick={() => setIsMapOpen(true)}
             title="Ouvrir la carte du monde"
          >
              {/* <div className="absolute top-2 left-2 text-[10px] font-bold bg-slate-900/80 px-1 rounded pointer-events-none">🌍 SÉLECTION CARTE</div> */}
              <WorldMap isMini={true} selectedCountries={selectedCountries} />
          </div>

      </div>

      {/* --- MAXI MAP MODAL --- */}
      {isMapOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-10">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl relative">
                  <button onClick={() => setIsMapOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">✕</button>
                  <h2 className="text-2xl font-bold mb-2 text-center">Sélectionner des pays à comparer</h2>
                  <p className="text-center text-slate-400 mb-4">Cliquez sur les pays pour les ajouter/retirer de l'analyse (Max 5)</p>
                  
                  <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <WorldMap 
                        isMini={false} 
                        selectedCountries={selectedCountries} 
                        onCountryClick={(c) => toggleCountry(c)} 
                      />
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                      <button onClick={() => setIsMapOpen(false)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold">Valider la sélection</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;