
import React from 'react';
import { X, Languages, Zap, Globe, Sparkles, BookOpen } from 'lucide-react';
import { SimplifiedExplanation } from '../types';

interface SimpleWisdomModalProps {
  explanations: SimplifiedExplanation[];
  onClose: () => void;
}

const SimpleWisdomModal: React.FC<SimpleWisdomModalProps> = ({ explanations, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card rounded-[3rem] border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Languages className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="oracle-title text-2xl md:text-3xl text-white tracking-wider leading-none">Simple Wisdom</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Complex scrolls made clear</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 mb-4">
            <p className="text-amber-200/70 italic text-sm text-center">
              "The Oracle has translated the heavy academic language of your scrolls into the common tongue. 
              Let these analogies illuminate the path where terminology once clouded it."
            </p>
          </div>

          <div className="grid gap-8">
            {explanations.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                  <Sparkles className="w-24 h-24 text-white" />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-indigo-500/20 rounded-lg text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                    Concept {idx + 1}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {item.conceptName}
                  </h3>
                </div>

                <div className="space-y-8">
                  <section>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-3 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> The Simple Truth
                    </span>
                    <p className="text-slate-200 text-lg leading-relaxed">
                      {item.simpleDefinition}
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">The Analogy</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic text-slate-300 text-sm leading-relaxed">
                        "{item.analogy}"
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Real-Time Reality</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-slate-300 text-sm leading-relaxed">
                        {item.realWorldExample}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-slate-900/60 shrink-0 text-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
          >
            I Understand Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleWisdomModal;
