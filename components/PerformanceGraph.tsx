
import React from 'react';
import { QuizAttempt } from '../types';
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface PerformanceGraphProps {
  attempts: QuizAttempt[];
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ attempts }) => {
  if (attempts.length === 0) return null;

  const maxAttempts = 10;
  const recentAttempts = attempts.slice(-maxAttempts);
  const avgScore = Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length);

  // Chart dimensions
  const height = 120;
  const width = 300;
  const barWidth = 20;
  const gap = 10;

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 mt-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="font-bold text-white uppercase tracking-widest text-sm">Learning Trajectory</h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-black text-slate-500 block">Average Mastery</span>
          <span className="text-xl font-black text-indigo-300">{avgScore}%</span>
        </div>
      </div>

      <div className="flex items-end justify-center gap-2 h-32 mb-4">
        {recentAttempts.map((attempt, idx) => (
          <div key={attempt.id} className="group relative flex flex-col items-center">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-slate-900 border border-indigo-500/30 px-3 py-1.5 rounded-lg shadow-xl text-[10px] whitespace-nowrap">
                <p className="font-bold text-indigo-300">{attempt.percentage}%</p>
                <p className="text-slate-500">{new Date(attempt.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 mx-auto -mt-1"></div>
            </div>

            <div 
              className={`w-4 md:w-6 rounded-t-md transition-all duration-1000 origin-bottom hover:brightness-125 ${
                attempt.percentage >= 80 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 
                attempt.percentage >= 50 ? 'bg-indigo-600/60' : 'bg-slate-700'
              }`}
              style={{ height: `${Math.max(attempt.percentage, 5)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
        <span>Earlier</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Mastery</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <span>Foundational</span>
          </div>
        </div>
        <span>Latest</span>
      </div>
    </div>
  );
};

export default PerformanceGraph;
