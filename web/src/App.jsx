import React, { useState, useEffect } from 'react'; // Ensure useState is imported
import * as d3 from 'd3';
import { processData } from './utils/dataProcessing';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';

function App() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keeps selection alive even if switching pages
  const [selectedCountries, setSelectedCountries] = useState([
    'France', 'United States', 'China', 'Germany', 'Brazil'
  ]);

  // Chargement des données
  useEffect(() => {
    d3.csv('economy.csv')
      .then(raw => {
        const processed = processData(raw);
        
        if (processed.length === 0) {
          throw new Error('Aucune donnée valide trouvée dans le fichier CSV');
        }
        
        setData(processed);
        
        const uniqueCountries = [...new Set(processed.map(d => d.country))].sort();
        setCountries(uniqueCountries);
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">EcoPulse</h2>
          <p className="text-slate-400">Chargement des données économiques...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-red-400 text-xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <p className="text-slate-500 text-sm">
            Assurez-vous que le fichier <code className="bg-slate-800 px-2 py-1 rounded">economy.csv</code> est présent dans le dossier <code className="bg-slate-800 px-2 py-1 rounded">public/</code>
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'home' && (
        <HomePage 
          data={data} 
          countries={countries} 
          onNavigate={setCurrentPage}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <DashboardPage 
          data={data} 
          countries={countries}
          // --- NEW STEP 2: Pass the state down to the Dashboard ---
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          // --------------------------------------------------------
        />
      )}
      
      {currentPage === 'team' && (
        <TeamPage />
      )}
    </div>
  );
}

export default App;