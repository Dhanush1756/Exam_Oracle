
import React, { useEffect, useState } from 'react';
import { User, QuizAttempt, StudySession } from '../types';
import { authService } from '../services/authService';
import PerformanceGraph from './PerformanceGraph';
import { User as UserIcon, ArrowLeft, History, Trophy, UserPlus, UserMinus, Users, Check, Search, BookOpen, Trash2, ExternalLink, Loader2, Coins, Crown, Copy, Link, Sparkles, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  onBack: () => void;
  onLoadSession: (session: StudySession) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onLoadSession }) => {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [circleRanking, setCircleRanking] = useState<User[]>([]);
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'archive' | 'friends' | 'leaderboard'>('stats');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    refreshData();
  }, [user]);

  const fetchStudyHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await authService.getStudyHistory(user.id);
      setStudyHistory(data);
    } catch (err) {
      console.error("Failed to fetch study history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const refreshData = () => {
    setHistory(authService.getQuizAttempts(user.id));
    setFriends(authService.getFriends());
    setCircleRanking(authService.getFriendCircleRanking());
    fetchStudyHistory();
  };

  const handleRemoveFriend = (id: string) => {
    if (confirm("Disconnect from this scholar's inner circle?")) {
      authService.removeFriend(id);
      refreshData();
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!manualId.trim()) return;
    try {
      authService.addFriend(manualId.trim());
      setManualId('');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await authService.deleteStudySession(id);
      await fetchStudyHistory();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Return to Sanctuary</span>
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1">
          <div className="glass-card p-8 rounded-[2.5rem] text-center border-t-2 border-indigo-500/30 sticky top-24">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="oracle-title text-2xl text-white mb-1">{user.name}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Master Scholar</p>
            
            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 mb-4 group/id relative">
               <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Academic ID</span>
               <div className="flex items-center justify-between gap-2">
                 <code className="text-[10px] text-indigo-400 font-mono truncate">{user.id}</code>
                 <button onClick={handleCopyId} className="text-slate-500 hover:text-white transition-colors">
                   {copySuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                 </button>
               </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-amber-500/10 py-2 px-4 rounded-xl border border-amber-500/20 mb-8">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-amber-200">{user.credits || 0} Credits</span>
            </div>
            
            <nav className="space-y-2 text-left">
              <button 
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Mastery Stats</span>
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Past Scrolls</span>
                {studyHistory.length > 0 && <span className="ml-auto bg-white/20 px-2 rounded-md text-[10px]">{studyHistory.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Circle Council</span>
              </button>
              <button 
                onClick={() => setActiveTab('friends')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'friends' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Inner Circle</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="md:col-span-2 space-y-8 min-h-[600px]">
          {activeTab === 'stats' && (
            <>
              <PerformanceGraph attempts={history} />
              <section className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                  <History className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">Chronicles of Wisdom</h3>
                </div>
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-sm italic py-10 text-center">No trials recorded.</p>
                  ) : (
                    history.slice().reverse().map(attempt => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                        <div>
                          <h4 className="text-slate-200 font-bold text-sm truncate max-w-[150px]">{attempt.quizTitle}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-black">{new Date(attempt.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-indigo-400">{attempt.percentage}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'archive' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-indigo-400 w-5 h-5" />
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Library of Past Scrolls</h3>
              </div>
              
              {isHistoryLoading ? (
                <div className="glass-card p-20 rounded-[2.5rem] text-center">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 text-sm italic">Unrolling the scrolls...</p>
                </div>
              ) : studyHistory.length === 0 ? (
                <div className="glass-card p-12 rounded-[2.5rem] text-center">
                  <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm italic">You haven't generated any study guides yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {studyHistory.map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => onLoadSession(session)}
                      className="group p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-indigo-200 transition-colors truncate">{session.guide.guideTitle}</h4>
                          {session.rewardClaimed && (
                            <div className="bg-amber-500/20 text-amber-500 p-1 rounded-md" title="Mastered & Reward Claimed">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-500 font-black uppercase">{new Date(session.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{session.guide.highPriorityConcepts.length} Core Concepts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button 
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="text-amber-400 w-5 h-5" />
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Circle Council Rankings</h3>
              </div>
              
              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                {circleRanking.map((u, i) => (
                  <div key={u.id} className={`flex items-center justify-between p-6 border-b border-white/5 last:border-0 ${u.id === user.id ? 'bg-indigo-500/10' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-amber-700 text-white' : 'text-slate-500'}`}>
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase">{u.name[0]}</div>
                      <div>
                        <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
                          {u.name}
                          {u.id === user.id && <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded-full">YOU</span>}
                        </h4>
                        <span className="text-[10px] text-slate-600 uppercase font-black">Scholarly Peer</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-black text-amber-200">{u.credits || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <section className="glass-card p-8 rounded-[2.5rem] border border-indigo-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">Add to Inner Circle</h3>
                </div>
                
                <form onSubmit={handleManualConnect} className="space-y-4">
                  <p className="text-slate-500 text-xs italic leading-relaxed">
                    "Only those with a unique Academic ID can enter your sanctuary. Exchange IDs with your peers to connect."
                  </p>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Enter Peer's Academic ID..." 
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs text-white focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" className="bg-indigo-600 px-6 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                      Connect
                    </button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold bg-rose-400/5 p-3 rounded-xl border border-rose-400/10">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  )}
                </form>
              </section>

              <section className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">Your Inner Circle</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {friends.length === 0 ? (
                    <div className="col-span-2 text-center py-10 opacity-40">
                      <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm italic">No peers found in your sanctuary yet.</p>
                    </div>
                  ) : (
                    friends.map(f => (
                      <div key={f.id} className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black uppercase">{f.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-white block truncate">{f.name}</span>
                          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Connected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-500 mr-2">
                            <Coins className="w-3 h-3" />
                            <span className="text-xs font-bold">{f.credits || 0}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveFriend(f.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-lg transition-all"
                            title="Remove from circle"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
