import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { processData } from './utils/dataProcessing';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
// 1. IMPORT DU CONTEXT
import { DashboardProvider } from './context/DashboardContext';

function App() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    d3.csv('economy.csv')
      .then(raw => {
        const processed = processData(raw);
        if (processed.length === 0) throw new Error('Pas de données');
        setData(processed);
        setCountries([...new Set(processed.map(d => d.country))].sort());
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Chargement...</div>;
  if (error) return <div className="h-screen bg-slate-950 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={setCurrentPage}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <DashboardPage 
            data={data} 
            countries={countries}
          />
        )}
        
        {currentPage === 'team' && (
          <TeamPage />
        )}
      </div>
    </DashboardProvider>
  );
}

export default App;