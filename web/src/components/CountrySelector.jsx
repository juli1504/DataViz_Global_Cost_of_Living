import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { countryColors } from '../utils/dataProcessing';
import { getContinent } from '../utils/continentMapping'; // Assure-toi d'importer le fichier créé
import WorldMap from './WorldMap';

const CountrySelector = ({ 
  countries, 
  selectedCountries, 
  onToggle
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // État pour gérer les continents ouverts/fermés
  // On initialise avec tous les continents fermés par défaut, ou ouverts selon ta préférence
  const [expandedContinents, setExpandedContinents] = useState({
    'Afrique': false,
    'Amériques': false,
    'Asie': false,
    'Europe': true, // Par exemple, Europe ouvert par défaut
    'Océanie': false,
  });

  // Toggle d'un continent
  const toggleContinent = (continent) => {
    setExpandedContinents(prev => ({
      ...prev,
      [continent]: !prev[continent]
    }));
  };

  // 1. Filtrage simple pour la recherche
  const filteredList = useMemo(() => {
    if (!search) return countries; 
    return countries.filter(c => 
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  // 2. Groupement par continent (seulement si pas de recherche)
  const groupedCountries = useMemo(() => {
    if (search) return null; // Si on cherche, on ne groupe pas

    const groups = countries.reduce((acc, country) => {
      const continent = getContinent(country);
      if (!acc[continent]) acc[continent] = [];
      acc[continent].push(country);
      return acc;
    }, {});

    // Trier les pays à l'intérieur de chaque continent
    Object.keys(groups).forEach(key => {
      groups[key].sort();
    });

    // Trier les continents par ordre alphabétique
    return Object.keys(groups).sort().reduce((obj, key) => {
      obj[key] = groups[key];
      return obj;
    }, {});
  }, [countries, search]);

  // Composant helper pour afficher un bouton pays
  const CountryButton = ({ country }) => {
    const isSelected = selectedCountries.includes(country);
    const idx = selectedCountries.indexOf(country);
    const canAdd = selectedCountries.length < 5;

    return (
      <button
        onClick={() => onToggle(country)}
        disabled={!isSelected && !canAdd}
        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-all mb-1 ${
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
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Barre de recherche */}
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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* CAS 1 : Recherche active -> Liste plate */}
          {search ? (
             <div className="space-y-1">
               {filteredList.length > 0 ? (
                 filteredList.map(country => (
                   <CountryButton key={country} country={country} />
                 ))
               ) : (
                 <div className="text-center text-slate-500 text-xs py-4">Aucun résultat</div>
               )}
             </div>
          ) : (
          
          /* CAS 2 : Pas de recherche -> Liste par Continents */
             <div className="space-y-2">
                {groupedCountries && Object.entries(groupedCountries).map(([continent, list]) => (
                  <div key={continent} className="border-b border-white/5 last:border-0 pb-2">
                    <button 
                      onClick={() => toggleContinent(continent)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider py-2 hover:text-cyan-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                         <span>{continent}</span>
                         <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">{list.length}</span>
                      </div>
                      <span className={`transform transition-transform duration-200 ${expandedContinents[continent] ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Liste des pays du continent (animée ou conditionnelle) */}
                    {expandedContinents[continent] && (
                      <div className="pl-1 space-y-0.5 animate-enter">
                        {list.map(country => (
                          <CountryButton key={country} country={country} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* MODAL CARTE (inchangé sauf props passées si besoin) */}
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