import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { countryColors } from '../utils/dataProcessing';
import WorldMap from './WorldMap';

const CountrySelector = ({ 
  countries, 
  selectedCountries, 
  onToggle,
  setSelectedCountries // <--- Das muss hier empfangen werden
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return countries; 
    return countries.filter(c => 
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  // ✅ NEUE LOGIK: Behalte das erste Land, lösche den Rest
  const handleReset = () => {
    if (setSelectedCountries && selectedCountries.length > 0) {
      // Wir setzen die Liste auf ein Array, das nur das allererste Element enthält
      setSelectedCountries([selectedCountries[0]]);
    }
  };

  return (
    <>
      <div className="glass-panel p-4 rounded-xl flex flex-col h-full relative">
        
        {/* HEADER */}
        <div className="flex-none mb-3 space-y-2">
          
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <span>🌍</span> Sélection ({selectedCountries.length}/5)
            </h3>
            
            {/* BUTTON: Erscheint nur, wenn man MEHR als 1 Land ausgewählt hat */}
            {selectedCountries.length > 1 && (
              <button 
                onClick={handleReset}
                className="text-[10px] bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2 py-1 rounded transition-colors whitespace-nowrap"
                title="Ne garder que le premier pays"
              >
                Effacer les comparaisons
              </button>
            )}
          </div>

          {/* SUCHE & MAP */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              <input 
                type="text"
                placeholder="Rechercher..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setIsMapOpen(true)}
              className="bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 px-3 rounded-lg transition-all flex items-center justify-center"
              title="Ouvrir la carte du monde"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* LISTE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map(country => {
                const isSelected = selectedCountries.includes(country);
                const canAdd = selectedCountries.length < 5;
                const idx = selectedCountries.indexOf(country);
                const color = idx >= 0 ? countryColors[idx % countryColors.length] : 'transparent';
                // Das erste Land markieren wir speziell
                const isPrimary = idx === 0;

                return (
                  <button
                    key={country}
                    onClick={() => onToggle(country)}
                    disabled={!isSelected && !canAdd}
                    className={`
                      px-2 py-2 rounded-lg text-xs text-left truncate transition-all border flex items-center gap-2
                      ${isSelected 
                        ? isPrimary 
                          ? 'bg-slate-800 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]' // Hauptland heller
                          : 'bg-slate-800/60 border-slate-600 text-slate-200'
                        : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }
                      ${!isSelected && !canAdd ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isSelected ? '' : 'bg-slate-700'}`}
                      style={{ backgroundColor: isSelected ? color : undefined }}
                    />
                    <span className="truncate">{country}</span>
                    {isPrimary && <span className="ml-auto text-[8px] uppercase tracking-wider text-slate-500">Principal</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8 text-sm italic">
              Aucun résultat
            </div>
          )}
        </div>
      </div>

      {/* MAP MODAL (Bleibt gleich) */}
      {isMapOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-enter">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-900/50 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Sélection Géographique</h2>
                <p className="text-slate-400 text-sm">Cliquez sur les pays pour les sélectionner (Max 5)</p>
              </div>
              <button onClick={() => setIsMapOpen(false)} className="w-10 h-10 rounded-full bg-slate-800 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center">✕</button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-900/50 relative">
               <WorldMap selectedCountries={selectedCountries} availableCountries={countries} onCountryClick={onToggle} />
            </div>
            <div className="p-4 border-t border-white/5 flex flex-wrap gap-2 items-center bg-[#0B0F19] rounded-b-2xl">
              <span className="text-xs text-slate-500 mr-2">Sélectionnés :</span>
              {selectedCountries.map((c, i) => (
                <div key={c} className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: countryColors[i % countryColors.length]}}></div>
                   <span className="text-white text-xs">{c}</span>
                   <button onClick={() => onToggle(c)} className="hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CountrySelector;