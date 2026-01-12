import React from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ data, position }) => {
  if (!data || !position) return null;

  const { x, y } = position;
  const { innerWidth, innerHeight } = window;

  const estimatedWidth = 220;
  const estimatedHeight = 150;
  const gap = 15;

  const isRight = x + estimatedWidth + gap > innerWidth;
  const isBottom = y + estimatedHeight + gap > innerHeight;

  const style = {
    left: x,
    top: y,
    transform: `translate(${isRight ? 'calc(-100% - 10px)' : '10px'}, ${isBottom ? 'calc(-100% - 10px)' : '10px'})`,
  };

  const tooltipContent = (
    <div 
      className="fixed z-[9999] pointer-events-none"
      style={style}
    >
      <div className="bg-[#0f172a] border border-slate-600 rounded-lg p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] min-w-[200px]">
        {data.title && (
          <div className="font-bold text-white border-b border-slate-700 pb-2 mb-2 text-xs uppercase tracking-wider">
            {data.title}
          </div>
        )}
        
        <div className="space-y-1.5">
          {data.items && data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                {item.color && (
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              <span className="text-white font-mono font-bold">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {data.footer && (
          <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-800 italic">
            {data.footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};

export default Tooltip;