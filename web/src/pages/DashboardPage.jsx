import React, { useState, useMemo } from 'react';
import CountrySelector from '../components/CountrySelector';
import YearSlider from '../components/YearSlider';
import LineChart from '../components/LineChart';
import TradeChart from '../components/TradeChart';
import EconomicPulse from '../components/EconomicPulse';
import PieChart from '../components/PieChart';
import { formatCurrency, formatNumber, countryColors } from '../utils/dataProcessing';

const DashboardPage = ({ data, countries, selectedCountries, setSelectedCountries }) => {
  const [activeTab, setActiveTab] = useState('pulse');
  const [currentYear, setCurrentYear] = useState(2020);
  const [compareMetric, setCompareMetric] = useState('gdp');
  const [showCrises, setShowCrises] = useState(true);
  const [showProjections, setShowProjections] = useState(true);

  const yearRange = useMemo(() => {
    if (data.length === 0) return { min: 1970, max: 2021 };
    return {
      min: Math.min(...data.map(d => d.year)),
      max: Math.max(...data.map(d => d.year))
    };
  }, [data]);

  const focusCountry = selectedCountries[0] || 'France';
  
  const pulseData = useMemo(() => {
    return data.filter(d => d.country === focusCountry);
  }, [data, focusCountry]);

  const compareDatasets = useMemo(() => {
    return selectedCountries.map(country => ({
      country,
      data: data.filter(d => d.country === country)
    }));
  }, [data, selectedCountries]);

  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      // Toggle country in selection (add/remove). Primary is handled separately via setPrimary.
      if (prev.includes(country)) return prev.length > 1 ? prev.filter(c => c !== country) : prev;
      return prev.length < 5 ? [...prev, country] : prev;
    });
  };

  // Promote a country to be the primary (index 0) without removing targets
  const setPrimary = (country) => {
    setSelectedCountries(prev => {
      if (!country) return prev;
      if (prev[0] === country) return prev;
      const others = prev.filter(c => c !== country);
      return [country, ...others].slice(0, 5);
    });
  };

  // --- DELETE FUNCTION ---
  const resetComparisons = () => {
    if (selectedCountries.length > 0) {
      setSelectedCountries([selectedCountries[0]]);
    }
  };

  const handleTabChange = (tab) => {
    // Just change the active tab; keep the current selections intact
    setActiveTab(tab);
  };

  const showSlider = activeTab === 'pulse' || (activeTab === 'compare' && compareMetric === 'sectors');

  return (
    <div className="h-screen w-full bg-[#0B0F19] text-white flex pt-16 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-80 flex-none bg-slate-900/50 border-r border-white/5 backdrop-blur-md flex flex-col p-6 z-20 h-full">
        <div className="flex-none">
          <div className="flex flex-col gap-2 mb-4">
            <NavButton active={activeTab === 'pulse'} onClick={() => handleTabChange('pulse')} icon="🧿" label="Résumé Pays" desc="Focus Année & Structure" />
            <NavButton active={activeTab === 'compare'} onClick={() => handleTabChange('compare')} icon="📊" label="Comparaisons" desc="Historique & Secteurs" />
          </div>

          <div className="space-y-2 mb-6">
             {activeTab === 'compare' && compareMetric !== 'sectors' && (
               <label className="flex items-center justify-between bg-slate-800/30 px-3 py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Afficher les crises</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${showCrises ? 'bg-red-500' : 'bg-slate-600'}`}>
                     <input type="checkbox" checked={showCrises} onChange={() => setShowCrises(!showCrises)} className="sr-only" />
                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showCrises ? 'left-4.5' : 'left-0.5'}`} />
                  </div>
               </label>
             )}

             {activeTab === 'compare' && compareMetric !== 'sectors' && (
               <div className="relative">
                 <label className="flex items-center justify-between bg-slate-800/30 px-3 py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2 group">
                      <span className="text-xs text-slate-300 font-medium">Projections (+5 ans)</span>
                      <div className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] flex items-center justify-center border border-slate-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">?</div>
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900 border border-slate-600 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                        <h4 className="font-bold text-white text-xs mb-2 pb-2 border-b border-white/10">🔮 Méthodologie</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Régression linéaire basée sur les 10 dernières années.</p>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showProjections ? 'bg-purple-500' : 'bg-slate-600'}`}>
                       <input type="checkbox" checked={showProjections} onChange={() => setShowProjections(!showProjections)} className="sr-only" />
                       <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showProjections ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                 </label>
               </div>
             )}
          </div>
        </div>

        {/* --- LISTE DER AUSGEWÄHLTEN LÄNDER --- */}
        <div className="h-40 flex-none flex flex-col border-b border-white/5 pb-4 mb-4">

            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
              <span>SELECTION</span>
              {selectedCountries.length > 1 ? (
                <button 
                  onClick={resetComparisons}
                  className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/20 hover:text-white transition-colors animate-enter"
                >
                  EFFACER LES CIBLES
                </button>
              ) : (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-500">{selectedCountries.length}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {/* Primary */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase mb-1">Pays principal</div>
                <div className="bg-slate-800/80 border border-slate-600 rounded-lg pl-3 pr-2 py-2 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: countryColors[0]}}></div>
                  <div className="text-xs font-medium text-slate-200 truncate">{selectedCountries[0] || 'France'}</div>
                  <div className="ml-auto text-[9px] text-slate-500">Principal</div>
                </div>
              </div>

              {/* Targets */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase mb-1">Pays cibles <span className="text-[10px] text-slate-500 ml-2">({Math.max(0, selectedCountries.length - 1)}/4)</span></div>
                <div className="space-y-2">
                  {selectedCountries.slice(1,5).map((country, idx) => (
                    <div key={country} className="flex items-center justify-between bg-slate-800/80 border border-slate-600 rounded-lg pl-3 pr-2 py-2 group hover:border-red-500/50 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: countryColors[(idx+1) % countryColors.length]}}></div>
                        <span className="text-xs font-medium text-slate-200 truncate" title={country}>{country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPrimary(country)} title="Définir comme principal" className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300">Définir</button>
                        <button onClick={() => toggleCountry(country)} className="ml-2 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">×</button>
                      </div>
                    </div>
                  ))}
                  {selectedCountries.length <= 1 && (
                    <div className="text-xs text-slate-500 italic">Aucun pays cible sélectionné</div>
                  )}
                </div>
              </div>
            </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase mb-2">Ajouter un pays</span>
          <div className="flex-1 overflow-hidden">
             <CountrySelector 
                countries={countries} 
                selectedCountries={selectedCountries} 
                onToggle={toggleCountry} 
                data={data}
                setSelectedCountries={setSelectedCountries}
             />
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0B0F19] to-[#111827] h-full">
        {showSlider && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-xl z-10 px-4 animate-enter">
             <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl py-1 px-4 shadow-xl">
                <YearSlider value={currentYear} min={yearRange.min} max={yearRange.max} onChange={setCurrentYear} />
             </div>
          </div>
        )}

        <div className="flex-1 w-full h-full p-6 overflow-hidden flex flex-col">
          {activeTab === 'pulse' && (
            <div className="flex-1 flex flex-col items-center justify-center pt-12">
              <div className="text-center mb-2 animate-enter relative z-0 flex-none">
                <h2 className="text-5xl font-bold text-white mb-1 tracking-tight">{focusCountry}</h2>
              </div>
              <div className="flex-1 w-full relative">
                 <EconomicPulse data={pulseData} year={currentYear} country={focusCountry} />
              </div>
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="w-full h-full flex flex-col animate-enter">
              <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4 ${compareMetric === 'sectors' ? 'pt-14 transition-all' : ''}`}>
                <div>
                  <h2 className="text-2xl font-bold text-white">Analyse Comparative</h2>
                  <p className="text-slate-500 text-sm">
                    {compareMetric === 'sectors' ? `Répartition sectorielle en ${currentYear}` : `Historique de ${yearRange.min} à ${yearRange.max}`}
                  </p>
                </div>
                <div className="bg-slate-900/80 p-1 rounded-xl border border-white/10 flex gap-1 overflow-x-auto max-w-full">
                  {['gdp', 'trade', 'population', 'sectors'].map(m => (
                    <button key={m} onClick={() => setCompareMetric(m)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${compareMetric === m ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                      {m === 'gdp' && '💰 PIB'}
                      {m === 'trade' && '⚖️ Commerce'}
                      {m === 'population' && '👥 Population'}
                      {m === 'sectors' && '🏭 Secteurs'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-3xl p-6 relative backdrop-blur-sm shadow-inner overflow-hidden">
                 {compareMetric === 'sectors' ? (
                   <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2">
                     {selectedCountries.length === 1 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full max-w-3xl h-full flex flex-col bg-slate-800/40 border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2 justify-center flex-none">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: countryColors[0]}}></div>
                                    <h3 className="font-bold text-white text-lg">{selectedCountries[0]}</h3>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <PieChart data={compareDatasets[0].data} year={currentYear} />
                                </div>
                            </div>
                        </div>
                     ) : (
                       <div className="grid gap-6 pb-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                         {compareDatasets.map((ds, idx) => (
                           <div key={ds.country} className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[350px]">
                             <div className="flex items-center gap-2 mb-2 justify-center">
                               <div className="w-3 h-3 rounded-full" style={{backgroundColor: countryColors[idx % countryColors.length]}}></div>
                               <h3 className="font-bold text-white text-lg">{ds.country}</h3>
                             </div>
                             <div className="flex-1 min-h-0">
                               <PieChart data={ds.data} year={currentYear} />
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ) : compareMetric === 'trade' ? (
                   <TradeChart datasets={compareDatasets} showCrises={showCrises} showProjection={showProjections} />
                 ) : (
                   <LineChart datasets={compareDatasets} metric={compareMetric} yLabel={compareMetric === 'population' ? 'Habitants' : 'USD'} showCrises={showCrises} showProjection={showProjections} formatValue={compareMetric === 'population' ? formatNumber : formatCurrency} />
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`w-full text-left p-3 rounded-xl transition-all border group ${active ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/10 border-cyan-500/50 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>
        {icon}
      </div>
      <div>
        <div className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-300'}`}>{label}</div>
        <div className="text-[10px] opacity-60 font-light">{desc}</div>
      </div>
    </div>
  </button>
);

export default DashboardPage;