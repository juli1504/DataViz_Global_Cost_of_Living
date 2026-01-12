import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { countryColors } from '../utils/dataProcessing';
import WorldMap from './WorldMap';

const CountrySelector = ({ 
  countries, 
  selectedCountries, 
  onToggle
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return countries; 
    return countries.filter(c => 
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsMapOpen(true)}
            className="bg-cyan-600/20 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-500/30 rounded-lg px-3 py-2 transition-all"
            title="Ouvrir la carte"
          >
            🗺️
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {filtered.map(country => {
            const isSelected = selectedCountries.includes(country);
            const idx = selectedCountries.indexOf(country);
            const canAdd = selectedCountries.length < 5;

            return (
              <button
                key={country}
                onClick={() => onToggle(country)}
                disabled={!isSelected && !canAdd}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-all ${
                  isSelected 
                    ? 'bg-slate-800 border border-slate-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                } ${!isSelected && !canAdd ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                   {isSelected && (
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: countryColors[idx % countryColors.length] }}></div>
                   )}
                   <span className="truncate max-w-[160px]">{country}</span>
                </div>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {isMapOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-enter">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl relative">
            
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">Sélection Géographique</h2>
                <p className="text-slate-400 text-sm">Cliquez sur les pays pour les sélectionner (Max 5)</p>
              </div>
              <button 
                onClick={() => setIsMapOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-800 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-900/50 relative">
               <WorldMap
                selectedCountries={selectedCountries}
                availableCountries={countries}
                onCountryClick={onToggle}
              />
            </div>

            <div className="p-4 border-t border-white/5 flex flex-wrap gap-2 items-center bg-[#0B0F19]">
              <span className="text-xs text-slate-500 mr-2">Sélectionnés :</span>
              {selectedCountries.map((c, i) => (
                <div key={c} className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: countryColors[i]}}></div>
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