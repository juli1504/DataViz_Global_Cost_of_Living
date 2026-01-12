import React from 'react';

const Navigation = ({ currentPage, onNavigate }) => {
  const pages = [
    { id: 'home', label: 'Accueil', icon: '🏠' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'team', label: 'Équipe', icon: '👥' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">EcoPulse</h1>
              <p className="text-[10px] text-slate-500 -mt-1">Global Economy Viz</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === page.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{page.icon}</span>
                <span>{page.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;