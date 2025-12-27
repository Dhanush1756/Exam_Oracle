
import React from 'react';
import { QuizAttempt } from '../types';
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface Series {
  label: string;
  color: string;
  attempts: QuizAttempt[];
}

interface PerformanceGraphProps {
  attempts?: QuizAttempt[]; // Solo history
  multiSeries?: Series[];    // Multiple users comparison
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ attempts, multiSeries }) => {
  // Normalize input into a series array
  const series: Series[] = multiSeries || (attempts && attempts.length > 0 ? [{
    label: 'Your Mastery',
    color: '#6366F1', // Indigo-500
    attempts: attempts
  }] : []);

  if (series.length === 0 || series.every(s => s.attempts.length === 0)) {
    return (
      <div className="glass-card p-10 rounded-3xl border border-slate-800 text-center opacity-40">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Trajectory Data Insufficient</p>
      </div>
    );
  }

  const maxPoints = 10;
  const padding = 20;
  const width = 400;
  const height = 180;
  
  // Plotting calculations
  const renderSeries = (s: Series, sIdx: number) => {
    const data = s.attempts.slice(-maxPoints);
    if (data.length < 1) return null;

    const points = data.map((attempt, i) => {
      const x = padding + (i * (width - 2 * padding) / (Math.max(data.length - 1, 1)));
      const y = height - padding - (attempt.percentage * (height - 2 * padding) / 100);
      return { x, y, percentage: attempt.percentage, id: attempt.id };
    });

    const pathD = points.length > 1 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    return (
      <g key={sIdx} className="series-group">
        {/* Glowing Path */}
        {points.length > 1 && (
          <>
            <path 
              d={pathD} 
              fill="none" 
              stroke={s.color} 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="opacity-20 blur-[4px]"
            />
            <path 
              d={pathD} 
              fill="none" 
              stroke={s.color} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="animate-[draw_2s_ease-out_forwards]"
              style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
            />
          </>
        )}
        
        {/* Points */}
        {points.map((p, pIdx) => (
          <g key={pIdx} className="group/point">
            <circle 
              cx={p.x} cy={p.y} r="6" 
              fill={s.color} 
              className="opacity-0 group-hover/point:opacity-20 transition-opacity"
            />
            <circle 
              cx={p.x} cy={p.y} r="3" 
              fill={s.color} 
              stroke="#050810" 
              strokeWidth="1.5"
              className="cursor-crosshair shadow-lg"
            />
            {/* Tooltip on Hover */}
            <g className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
               <rect x={p.x - 20} y={p.y - 30} width="40" height="20" rx="4" fill="#0f172a" stroke={s.color} strokeWidth="1" />
               <text x={p.x} y={p.y - 17} textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{p.percentage}%</text>
            </g>
          </g>
        ))}
      </g>
    );
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/10 bg-indigo-500/5 mt-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="font-bold text-white uppercase tracking-widest text-sm">Learning Trajectory</h3>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {series.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter truncate max-w-[80px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-slate-950/20 rounded-2xl border border-white/5 overflow-hidden">
        {/* Grid lines */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" strokeDasharray="2,4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" strokeDasharray="2,4" />
          
          <text x={padding - 5} y={padding + 5} textAnchor="end" fontSize="8" fill="#475569">100</text>
          <text x={padding - 5} y={height - padding} textAnchor="end" fontSize="8" fill="#475569">0</text>

          {series.map((s, idx) => renderSeries(s, idx))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4">
        <span>Earlier Trials</span>
        <span>Latest Trial</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
};

export default PerformanceGraph;
