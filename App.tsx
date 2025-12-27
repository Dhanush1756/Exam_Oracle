
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
import { Sparkles, Loader2, AlertCircle, LogOut, User as UserIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'profile'>('home');
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
      <div className="min-h-screen pb-20 selection:bg-purple-500/30">
        <OracleHeader />
        <AuthForms onAuthSuccess={setUser} />
      </div>
    );
  }

  if (view === 'profile') {
    return (
      <ProfilePage 
        user={user} 
        onBack={() => setView('home')} 
        onLoadSession={handleLoadSession}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-between items-center relative z-50">
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

      {/* Floating ChatBot - Available once any documents are uploaded */}
      {allSources.length > 0 && <ChatBot sources={allSources} />}

      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[2%] w-[40rem] h-[40rem] bg-purple-600/[0.03] rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
};

export default App;
