
import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Lightbulb, CheckCircle, ListChecks, Clock, Target, Loader2, PlayCircle, ShieldQuestion, Award, ExternalLink, Globe, Users, Zap, Languages, BookOpen, Layers, Hash, AlertCircle } from 'lucide-react';
import { StudyGuideResponse, StudySource, Quiz, QuizAttempt, User, SimplifiedExplanation, StudySession } from '../types';
import { generateQuiz, generateSimpleExplanations } from '../services/geminiService';
import { authService } from '../services/authService';
import QuizComponent from './QuizComponent';
import PerformanceGraph from './PerformanceGraph';
import SimpleWisdomModal from './SimpleWisdomModal';
import CelebrationModal from './CelebrationModal';

interface StudyGuideProps {
  guide: StudyGuideResponse;
  sources: StudySource[];
  activeSessionId?: string; // Passed from App to track this specific session
  onUserUpdate?: (user: User) => void;
}

const StudyGuide: React.FC<StudyGuideProps> = ({ guide, sources, activeSessionId, onUserUpdate }) => {
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [preferredDifficulty, setPreferredDifficulty] = useState<'mixed' | 'easy' | 'moderate' | 'difficult'>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);

  // Simple Explainer State
  const [simplifiedConcepts, setSimplifiedConcepts] = useState<SimplifiedExplanation[] | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [showSimpleWisdom, setShowSimpleWisdom] = useState(false);
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setHistory(authService.getQuizAttempts(authService.getCurrentUser()?.id));
    setFriendsList(authService.getFriends());
  }, [quiz]);

  const progress = Math.round((completedConcepts.size / guide.highPriorityConcepts.length) * 100);

  // Mastery Reward Logic
  useEffect(() => {
    if (progress === 100 && activeSessionId) {
      checkAndReward();
    }
  }, [progress, activeSessionId]);

  const checkAndReward = async () => {
    if (!activeSessionId) return;
    
    // Fetch current history to find this session
    const userId = authService.getCurrentUser()?.id;
    if (!userId) return;
    
    const sessions = await authService.getStudyHistory(userId);
    const currentSession = sessions.find(s => s.id === activeSessionId);
    
    if (currentSession && !currentSession.rewardClaimed) {
      // Grant reward
      const updatedUser = authService.addCredits(10);
      if (updatedUser && onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      // Mark as claimed in IndexedDB
      currentSession.rewardClaimed = true;
      await authService.updateStudySession(currentSession);
      
      // Trigger visual hooray
      setShowCelebration(true);
    }
  };

  const toggleConcept = (name: string) => {
    const next = new Set(completedConcepts);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setCompletedConcepts(next);
  };

  const handleSimplifyAll = async () => {
    if (simplifiedConcepts) {
      setShowSimpleWisdom(true);
      return;
    }
    
    setIsSimplifying(true);
    try {
      const results = await generateSimpleExplanations(guide.highPriorityConcepts, sources);
      setSimplifiedConcepts(results);
      setShowSimpleWisdom(true);
    } catch (err) {
      console.error(err);
      setError("The Oracle could not simplify the scrolls at this time.");
    } finally {
      setIsSimplifying(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleStartQuiz = async () => {
    // Basic validation
    if (questionCount < 1) {
      setError("The ritual requires at least one trial.");
      return;
    }
    if (questionCount > 25) {
      setError("The Oracle's energy is capped at 25 trials per session.");
      return;
    }

    setIsGeneratingQuiz(true);
    setError(null);
    try {
      const q = await generateQuiz(sources, guide.highPriorityConcepts, preferredDifficulty, questionCount);
      const sessionId = isCollaborative ? `session_${Date.now()}` : undefined;
      
      setQuiz({
        ...q,
        isCollaborative,
        sessionId
      });
      
      setTimeout(() => {
        const el = document.getElementById('quiz-portal');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError("The trial could not be manifested. Perhaps the scrolls are too complex.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Divine Celebration Pop Up */}
      {showCelebration && (
        <CelebrationModal onClose={() => setShowCelebration(false)} />
      )}

      {/* Simple Wisdom Modal Popup */}
      {showSimpleWisdom && simplifiedConcepts && (
        <SimpleWisdomModal 
          explanations={simplifiedConcepts} 
          onClose={() => setShowSimpleWisdom(false)} 
        />
      )}

      {/* Progress Header */}
      <div className="sticky top-4 z-30 glass-card px-6 py-4 rounded-2xl border-b-2 border-indigo-500/30 flex items-center justify-between gap-6 shadow-2xl">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Mastery Level</span>
            <span className="text-sm font-bold text-white">{progress}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${progress === 100 ? 'from-amber-400 to-amber-600' : 'from-indigo-500 to-emerald-500'} transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
           <Clock className="w-4 h-4 text-indigo-400" />
           <span className="text-sm font-medium">{guide.estimatedStudyTime || '2-3 hours'}</span>
        </div>
      </div>

      {/* Oracle Intro & Explainer Button */}
      <section className="glass-card p-10 rounded-3xl relative overflow-hidden border-t-2 border-amber-500/30 shadow-2xl group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles className="w-48 h-48 text-amber-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h2 className="oracle-title text-3xl text-amber-100 uppercase tracking-widest leading-none">{guide.guideTitle}</h2>
              <p className="text-amber-500/60 text-xs font-bold uppercase mt-1">High-Priority Prophecy</p>
            </div>
          </div>
          
          <button
            onClick={handleSimplifyAll}
            disabled={isSimplifying}
            className={`px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 transform hover:-translate-y-1 active:scale-95 ${isSimplifying ? 'animate-pulse' : ''}`}
          >
            {isSimplifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Manifesting Clarity...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                {simplifiedConcepts ? 'Review Simple Wisdom' : 'Explain in Simple English'}
              </>
            )}
          </button>
        </div>
        <p className="text-slate-300 italic text-xl leading-relaxed border-l-4 border-amber-500/30 pl-8 py-2 relative z-10">
          "{guide.oracleMessage}"
        </p>
      </section>

      {/* Core Concepts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="text-purple-400" />
            Core Overlaps
          </h3>
        </div>
        <div className="grid gap-6">
          {guide.highPriorityConcepts.map((concept, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleConcept(concept.name)}
              className={`glass-card p-8 rounded-3xl transition-all duration-300 border cursor-pointer group hover:shadow-indigo-500/5 ${
                completedConcepts.has(concept.name) 
                  ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                  : 'border-slate-700 hover:border-purple-500/40 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    completedConcepts.has(concept.name) ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-600 group-hover:border-purple-500'
                  }`}>
                    {completedConcepts.has(concept.name) && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <h4 className={`text-2xl font-bold transition-colors ${
                    completedConcepts.has(concept.name) ? 'text-slate-400 line-through' : 'text-purple-300'
                  }`}>
                    {concept.name}
                  </h4>
                </div>
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">{concept.description}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-500 mb-3 block">Strategy</span>
                  <p className="text-sm text-slate-400 italic leading-relaxed">{concept.priorityReasoning}</p>
                </div>
                <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500 mb-3 block">Mnemonic Tip</span>
                  <p className="text-sm text-amber-50/80 font-medium leading-relaxed">{concept.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Study Plan */}
      <section className="glass-card p-10 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-4 mb-8">
          <ListChecks className="text-emerald-400 w-8 h-8" />
          <h3 className="text-3xl font-bold text-white">Your Quest Log</h3>
        </div>
        <div className="space-y-6">
          {guide.suggestedStudyPlan.map((step, idx) => (
            <div key={idx} className="flex items-start gap-6 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-400 font-black text-sm">
                {idx + 1}
              </div>
              <p className="text-slate-200 text-lg pt-2">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* External References */}
      {guide.externalReferences && guide.externalReferences.length > 0 && (
        <section className="glass-card p-10 rounded-[3rem] border border-indigo-500/20">
          <div className="flex items-center gap-4 mb-8">
            <Globe className="text-indigo-400 w-8 h-8" />
            <h3 className="text-3xl font-bold text-white">The Great Library</h3>
          </div>
          <div className="grid gap-6">
            {guide.externalReferences.map((ref, idx) => (
              <a 
                key={idx} 
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-start gap-6 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-indigo-200 font-bold text-lg mb-1">{ref.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{ref.description}</p>
                  <span className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest">{new URL(ref.url).hostname}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Quiz Section */}
      <div id="quiz-portal" className="pt-20">
        {!quiz && !isGeneratingQuiz ? (
          <section className="glass-card p-12 rounded-[3rem] border border-indigo-500/20 text-center shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-64 h-64 text-indigo-500" />
            </div>

            <ShieldQuestion className="text-indigo-400 w-12 h-12 mx-auto mb-6" />
            <h3 className="oracle-title text-4xl text-white mb-4">The Trial of Mastery</h3>
            <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg">
              "Choose your path. Will you walk it alone, or challenge your peers in a timed ritual?"
            </p>

            {/* Trial Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
              <button 
                onClick={() => setIsCollaborative(false)}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${!isCollaborative ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
              >
                <Target className="w-8 h-8" />
                <span className="font-black uppercase tracking-widest text-xs">Solo Meditation</span>
              </button>
              <button 
                onClick={() => setIsCollaborative(true)}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${isCollaborative ? 'bg-purple-500/10 border-purple-500 text-white shadow-xl shadow-purple-500/20' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
              >
                <Users className="w-8 h-8" />
                <span className="font-black uppercase tracking-widest text-xs">Collaborative Trial</span>
              </button>
            </div>

            {isCollaborative && (
              <div className="mb-10 max-w-lg mx-auto animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Invite Initiates</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {friendsList.length === 0 ? (
                    <p className="text-[10px] text-slate-500 uppercase font-black">Visit your profile to find scholars first.</p>
                  ) : (
                    friendsList.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => toggleFriend(f.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedFriends.includes(f.id) ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                      >
                        {f.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Ritual Intensity (Question Count) */}
            <div className="mb-10 max-w-lg mx-auto bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Hash className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Ritual Intensity</span>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full px-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase">1</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="25" 
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase">25</span>
                </div>
                
                <div className="flex items-center gap-3 bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/30">
                  <span className="text-3xl font-black text-white">{questionCount}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Questions</span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {[5, 10, 15, 20].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${questionCount === count ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {(['mixed', 'easy', 'moderate', 'difficult'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setPreferredDifficulty(level)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${preferredDifficulty === level ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                >
                  {level} Path
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 justify-center text-rose-400 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleStartQuiz}
              className={`px-10 py-5 bg-gradient-to-r ${isCollaborative ? 'from-purple-600 to-indigo-600' : 'from-indigo-600 to-purple-600'} text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 mx-auto shadow-2xl transition-all hover:scale-105 active:scale-95`}
            >
              <PlayCircle className="w-6 h-6" />
              {isCollaborative ? 'Start Shared Trial' : 'Begin Solo Trial'}
            </button>
          </section>
        ) : isGeneratingQuiz ? (
          <div className="text-center py-24 animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-8" />
            <h3 className="oracle-title text-3xl text-white tracking-widest uppercase">Extracting {questionCount} Trials...</h3>
            <p className="text-slate-500 italic mt-4">Consulting the ancient knowledge pools for your test.</p>
          </div>
        ) : (
          quiz && <QuizComponent quiz={quiz} onClose={() => setQuiz(null)} />
        )}
      </div>
    </div>
  );
};

export default StudyGuide;
