import React from 'react';

const YearSlider = ({ value, min, max, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="flex justify-between items-end mb-1 px-1">
         <span className="text-[10px] text-slate-500 font-mono font-bold">{min}</span>
         <span className="text-xl font-bold text-cyan-400 leading-none tabular-nums tracking-tighter filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {value}
         </span>
         <span className="text-[10px] text-slate-500 font-mono font-bold">{max}</span>
      </div>
      
      <div className="relative w-full h-4 flex items-center group cursor-pointer">
        <div className="absolute w-full h-1 bg-slate-800 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gradient-to-r from-cyan-600 to-blue-500" 
             style={{ width: `${percentage}%` }}
           />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div 
            className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] border-[1.5px] border-cyan-500 transition-transform hover:scale-125 pointer-events-none"
            style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  );
};

export default YearSlider;