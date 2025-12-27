
import React, { useEffect, useState } from 'react';
import { Trophy, Coins, Sparkles, Star, PartyPopper } from 'lucide-react';

interface CelebrationModalProps {
  onClose: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ onClose }) => {
  const [showPops, setShowPops] = useState(false);

  useEffect(() => {
    setShowPops(true);
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-700" />
      
      {/* Confetti / Pops container */}
      {showPops && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#F59E0B', '#6366F1', '#10B981', '#EC4899'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-lg glass-card p-12 rounded-[4rem] border-2 border-amber-500/40 text-center shadow-[0_0_100px_rgba(245,158,11,0.2)] animate-in zoom-in slide-in-from-bottom-20 duration-1000">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="flex justify-center gap-3">
            <Sparkles className="text-amber-400 w-6 h-6 animate-pulse" />
            <h2 className="oracle-title text-5xl text-white tracking-widest">HOORAY!</h2>
            <Sparkles className="text-amber-400 w-6 h-6 animate-pulse" />
          </div>
          
          <p className="text-slate-300 text-xl font-medium leading-relaxed italic">
            "You have achieved Divine Mastery of the scrolls. The Oracle is truly impressed by your dedication."
          </p>
          
          <div className="py-8 px-10 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 inline-block relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Sacred Reward Granted</span>
              <div className="flex items-center gap-3">
                <Coins className="w-10 h-10 text-amber-400" />
                <span className="text-5xl font-black text-white">+10</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <button 
              onClick={onClose}
              className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              Continue My Journey
            </button>
          </div>
        </div>
        
        {/* Floating background icons */}
        <Star className="absolute top-10 right-10 w-4 h-4 text-amber-400/20 animate-spin" />
        <Star className="absolute bottom-10 left-10 w-6 h-6 text-amber-400/20 animate-pulse" />
        <PartyPopper className="absolute top-20 left-10 w-8 h-8 text-amber-400/10 -rotate-12" />
      </div>
    </div>
  );
};

export default CelebrationModal;
