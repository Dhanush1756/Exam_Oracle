
import React, { useState, useEffect } from 'react';
import OracleHeader from './components/OracleHeader';
import SourceUpload from './components/SourceUpload';
import StudyGuide from './components/StudyGuide';
import ProfilePage from './components/ProfilePage';
import ChatBot from './components/ChatBot';
import { AuthForms } from './components/AuthForms';
import { StudySource, StudyGuideResponse, User, StudySession } from './types';
import { generateStudyGuide } from './services/geminiService';
import { authService } from './services/authService';
import { Sparkles, Loader2, AlertCircle, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('oracle_theme') as 'dark' | 'light') || 'dark';
  });
  const [sources, setSources] = useState<Record<'syllabus' | 'notes' | 'textbook', StudySource[]>>({
    syllabus: [],
    notes: [],
    textbook: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guide, setGuide] = useState<StudyGuideResponse | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) setUser(activeUser);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem('oracle_theme', theme);
    
    if (theme === 'light') {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    } else {
      document.body.style.backgroundColor = '#050810';
      document.body.style.color = '#f8fafc';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddSource = (source: StudySource) => {
    setSources(prev => ({
      ...prev,
      [source.category]: [...prev[source.category], source]
    }));
    setError(null);
  };

  const handleRemoveSource = (category: 'syllabus' | 'notes' | 'textbook', id: string) => {
    setSources(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s.id !== id)
    }));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setGuide(null);
    setActiveSessionId(undefined);
    setView('home');
    setSources({ syllabus: [], notes: [], textbook: [] });
  };

  const handleLoadSession = (session: StudySession) => {
    setGuide(session.guide);
    setActiveSessionId(session.id);
    const groupedSources: Record<'syllabus' | 'notes' | 'textbook', StudySource[]> = {
      syllabus: [],
      notes: [],
      textbook: []
    };
    session.sources.forEach(s => {
      groupedSources[s.category].push(s);
    });
    setSources(groupedSources);
    setView('home');
    setTimeout(() => {
      const resultsEl = document.getElementById('results-section');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const allSources = [...sources.syllabus, ...sources.notes, ...sources.textbook];
  const categoriesWithSources = Object.values(sources).filter(list => list.length > 0).length;
  const isReady = categoriesWithSources >= 2;

  const handleConsultOracle = async () => {
    setIsAnalyzing(true);
    setError(null);
    setGuide(null);

    try {
      const result = await generateStudyGuide(allSources);
      setGuide(result);
      
      const newSessionId = await authService.saveStudySession({
        guide: result,
        sources: allSources
      });
      setActiveSessionId(newSessionId);

      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The celestial connection was interrupted.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen pb-20 selection:bg-purple-500/30 ${theme}`}>
        <div className="flex justify-end p-4">
           <button onClick={toggleTheme} className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all">
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>
        </div>
        <OracleHeader />
        <AuthForms onAuthSuccess={setUser} />
        <style>{`
          .light .glass-card { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .light .oracle-title { color: #1e1b4b !important; background: none; -webkit-text-fill-color: initial; }
          .light .text-slate-200, .light .text-white { color: #1e293b !important; }
          .light .text-slate-400, .light .text-slate-500 { color: #64748b !important; }
          .light .bg-slate-900, .light .bg-slate-900\\/50 { background: #f1f5f9 !important; }
          .light .border-slate-700, .light .border-slate-800 { border-color: #e2e8f0 !important; }
          .light input { background: #fff !important; color: #1e293b !important; border-color: #cbd5e1 !important; }
          .light button.bg-slate-900\\/40 { background: #f1f5f9; color: #64748b; }
        `}</style>
      </div>
    );
  }

  if (view === 'profile') {
    return (
      <div className={theme}>
        <ProfilePage 
          user={user} 
          onBack={() => setView('home')} 
          onLoadSession={handleLoadSession}
          onUserUpdate={handleUserUpdate}
        />
        <style>{`
          .light .glass-card { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(0,0,0,0.08); }
          .light .oracle-title { color: #1e1b4b !important; background: none; -webkit-text-fill-color: initial; }
          .light .text-slate-200, .light .text-white { color: #1e293b !important; }
          .light .text-slate-400, .light .text-slate-500 { color: #64748b !important; }
          .light .bg-slate-950, .light .bg-slate-900 { background: #f1f5f9 !important; }
          .light .border-slate-800, .light .border-slate-700 { border-color: #e2e8f0 !important; }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 selection:bg-purple-500/30 ${theme}`}>
      <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('profile')}
            className="flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md hover:border-indigo-500/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-slate-200 text-xs font-black uppercase block tracking-tighter">Academic Profile</span>
              <span className="text-slate-400 text-[10px] font-bold">Greetings, {user.name}</span>
            </div>
          </button>
          
          <button onClick={toggleTheme} className="p-2.5 bg-slate-900/40 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em]"
        >
          <LogOut className="w-4 h-4" />
          Leave Temple
        </button>
      </div>

      <OracleHeader />

      <main className="max-w-6xl mx-auto px-4">
        {!guide && !isAnalyzing && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
              <SourceUpload
                category="syllabus"
                label="Syllabus"
                description="The path mapped out"
                sources={sources.syllabus}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('syllabus', id)}
              />
              <SourceUpload
                category="notes"
                label="Lecture Notes"
                description="Your personal scribbles"
                sources={sources.notes}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('notes', id)}
              />
              <SourceUpload
                category="textbook"
                label="Textbook/Chapters"
                description="The foundations of truth"
                sources={sources.textbook}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('textbook', id)}
              />
            </div>

            <div className="text-center mb-16">
              <button
                onClick={handleConsultOracle}
                disabled={!isReady || isAnalyzing}
                className={`
                  px-14 py-7 rounded-[2.5rem] font-black text-2xl transition-all duration-500 flex items-center gap-4 mx-auto
                  ${isReady && !isAnalyzing
                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.5)] transform hover:-translate-y-2 active:scale-95' 
                    : 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin w-8 h-8" />
                    Divining...
                  </>
                ) : (
                  <>
                    <Sparkles className={isReady ? "text-amber-300 animate-pulse w-8 h-8" : "w-8 h-8 opacity-20"} />
                    Summon Knowledge
                  </>
                )}
              </button>
              {!isReady && (
                <p className="text-slate-500 text-xs mt-8 font-black uppercase tracking-[0.3em] opacity-60">
                  "Upload from at least two categories to begin the ritual."
                </p>
              )}
            </div>
          </>
        )}

        {isAnalyzing && (
          <div className="max-w-md mx-auto text-center py-24 animate-in zoom-in duration-500">
            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-10" />
            <h2 className="text-3xl font-bold text-white mb-4 italic oracle-title tracking-widest">Sifting Through the Scrolls...</h2>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 flex items-center gap-6 mb-12">
            <AlertCircle className="text-rose-400 w-8 h-8 flex-shrink-0" />
            <p className="text-rose-200/60 text-sm leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <div id="results-section">
          {guide && (
            <>
              <StudyGuide 
                guide={guide} 
                sources={allSources} 
                activeSessionId={activeSessionId} 
                onUserUpdate={setUser}
              />
              <div className="mt-16 text-center pb-24">
                 <button 
                  onClick={() => {
                    setGuide(null);
                    setSources({ syllabus: [], notes: [], textbook: [] });
                    setActiveSessionId(undefined);
                  }}
                  className="px-12 py-5 rounded-[2rem] border-2 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all text-xs font-black uppercase tracking-[0.4em]"
                >
                  Start New Session
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {allSources.length > 0 && <ChatBot sources={allSources} />}

      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[2%] w-[40rem] h-[40rem] bg-purple-600/[0.03] rounded-full blur-[150px]"></div>
      </div>

      <style>{`
        .light .glass-card { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .light .oracle-title { color: #1e1b4b !important; background: none; -webkit-text-fill-color: initial; }
        .light .text-slate-200, .light .text-white { color: #1e293b !important; }
        .light .text-slate-400, .light .text-slate-500 { color: #64748b !important; }
        .light .bg-slate-900, .light .bg-slate-900\\/40, .light .bg-slate-900\\/50 { background: #f1f5f9 !important; }
        .light .border-slate-800, .light .border-slate-700 { border-color: #cbd5e1 !important; }
        .light .text-indigo-400 { color: #4f46e5 !important; }
        .light .text-indigo-300 { color: #4338ca !important; }
        .light .bg-slate-950 { background: #fff !important; }
        .light .bg-indigo-500\\/10 { background: rgba(79, 70, 229, 0.1) !important; }
        .light .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; }
        .light .bg-emerald-500\\/5 { background: rgba(16, 185, 129, 0.08) !important; }
        .light .border-emerald-500\\/30 { border-color: rgba(16, 185, 129, 0.3) !important; }
        .light .bg-indigo-600 { background: #4f46e5 !important; }
        .light .text-amber-200 { color: #92400e !important; }
        .light .bg-amber-500\\/10 { background: rgba(245, 158, 11, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default App;
