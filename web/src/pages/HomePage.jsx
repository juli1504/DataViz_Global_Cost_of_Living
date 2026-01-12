import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
         <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[20%] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] opacity-20" />
      </div>

      <div className="relative z-10 text-center max-w-4xl px-6">
        <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-medium mb-8 animate-enter">
          ✨ Global Economy Indicators
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-tight animate-enter" style={{animationDelay:'0.1s'}}>
          <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Eco</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pulse</span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-enter" style={{animationDelay:'0.2s'}}>
          Explorez 50 ans d'histoire économique mondiale. Comparez le PIB, 
          analysez les flux commerciaux et comprenez les crises via une visualisation interactive immersive.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-enter" style={{animationDelay:'0.3s'}}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Lancer le Dashboard <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
          
          <button
            onClick={() => onNavigate('team')}
            className="px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-xl text-lg border border-white/10 hover:bg-slate-800 transition-all"
          >
            L'équipe
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-slate-600 text-sm">
        Données Kaggle &bull; Visualisation React & D3.js
      </div>
    </div>
  );
};

export default HomePage;