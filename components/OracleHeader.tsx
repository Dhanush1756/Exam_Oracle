
import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { authService } from '../services/authService';

const OracleHeader: React.FC = () => {
  const [credits, setCredits] = useState(0);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      setCredits(user.credits || 0);
    }
  }, [user]);

  return (
    <header className="text-center py-12 px-4 relative">
      {user && (
        <div className="absolute top-4 right-8 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20 group animate-in fade-in slide-in-from-right-4 duration-1000">
          <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 block leading-none">Scholar Wealth</span>
            <span className="text-lg font-black text-amber-200">{credits}</span>
          </div>
        </div>
      )}
      
      <div className="inline-block relative">
        <h1 className="oracle-title text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-400 to-indigo-300 mb-4 animate-pulse">
          EXAM ORACLE
        </h1>
        <div className="absolute -inset-1 bg-purple-500/20 blur-xl -z-10 rounded-full"></div>
      </div>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mt-4 italic font-light">
        "Bring me your scrolls, your scribbles, and your heavy tomes. I shall illuminate the path to mastery, revealing only what truly matters."
      </p>
    </header>
  );
};

export default OracleHeader;
