import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard doit être utilisé à l\'intérieur d\'un DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('pulse'); 

  const [pulseSelection, setPulseSelection] = useState('France');
  const [compareSelection, setCompareSelection] = useState(['France', 'Algeria']);

  const [currentYear, setCurrentYear] = useState(2020);
  const [compareMetric, setCompareMetric] = useState('gdp');
  const [showCrises, setShowCrises] = useState(true);
  const [showProjections, setShowProjections] = useState(true);

  const toggleCountry = (country) => {
    if (activeTab === 'pulse') {
      setPulseSelection(country);
    } else {
      setCompareSelection(prev => {
        if (prev.includes(country)) {
          return prev.length > 1 ? prev.filter(c => c !== country) : prev;
        }
        return prev.length < 5 ? [...prev, country] : prev;
      });
    }
  };

  const value = {
    activeTab,
    setActiveTab,
    pulseSelection,
    compareSelection,
    toggleCountry,
    currentYear,
    setCurrentYear,
    compareMetric,
    setCompareMetric,
    showCrises,
    setShowCrises,
    showProjections,
    setShowProjections
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;