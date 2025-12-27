
import React, { useState, useEffect, useRef } from 'react';
import { Quiz, QuizQuestion, QuizAttempt } from '../types';
import { authService } from '../services/authService';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, RotateCcw, Award, BarChart3, Clock, Trophy, Users } from 'lucide-react';
import PerformanceGraph from './PerformanceGraph';

interface QuizComponentProps {
  quiz: Quiz;
  onClose: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [rankings, setRankings] = useState<QuizAttempt[]>([]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 60); // 1 minute per question
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef<number | null>(null);

  const currentQuestion = quiz.questions[currentIdx];

  useEffect(() => {
    setHistory(authService.getQuizAttempts(authService.getCurrentUser()?.id));
    
    // Start Timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    if (selectedOption === currentQuestion.correctOptionIndex) setScore(prev => prev + 1);
    setShowFeedback(true);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const percentage = Math.round((score / quiz.questions.length) * 100);
    authService.saveQuizAttempt({
      quizTitle: quiz.title,
      score: score,
      total: quiz.questions.length,
      percentage: percentage,
      timeTaken: timeTaken,
      sessionId: quiz.sessionId
    });

    if (quiz.sessionId) {
      setRankings(authService.getSessionRankings(quiz.sessionId));
    }
    
    setHistory(authService.getQuizAttempts(authService.getCurrentUser()?.id));
    setIsFinished(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="glass-card p-10 rounded-[3rem] text-center animate-in zoom-in duration-500 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 transform rotate-3">
            <Award className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="oracle-title text-4xl text-white mb-2 tracking-wide">Trial Result</h2>
          
          <div className="flex justify-center gap-8 mb-8 mt-6">
            <div className="text-center">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Mastery</span>
              <span className="text-3xl font-black text-indigo-300">{percentage}%</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Time</span>
              <span className="text-3xl font-black text-amber-300">{formatTime(timeTaken)}</span>
            </div>
          </div>

          {/* Collaborative Rankings */}
          {quiz.isCollaborative && quiz.sessionId && (
            <div className="mb-10 bg-indigo-500/5 rounded-3xl p-6 border border-indigo-500/10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Collaborative Ranking</h3>
              </div>
              <div className="space-y-2">
                {rankings.map((rank, i) => (
                  <div key={rank.id} className={`flex items-center justify-between p-3 rounded-xl border ${rank.userId === authService.getCurrentUser()?.id ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500 w-4">#{i + 1}</span>
                      <span className="text-sm font-bold text-white">{rank.userName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-indigo-300">{rank.score}/{rank.total}</span>
                      <span className="text-[10px] font-medium text-slate-500">{formatTime(rank.timeTaken)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PerformanceGraph attempts={history} />

          <button 
            onClick={onClose}
            className="mt-10 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" /> Back to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-[3rem] animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-black text-indigo-300">
            TRIAL {currentIdx + 1} / {quiz.questions.length}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-colors ${timeLeft < 30 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
          {quiz.isCollaborative && <Users className="w-4 h-4 mr-1 text-purple-400" />}
          POINTS: {score}
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="grid gap-4 mb-12 relative z-10">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctOptionIndex;
          const isSelected = selectedOption === idx;
          let cardStyle = "bg-slate-900/40 border-slate-800 text-slate-300";
          if (showFeedback) {
            if (isCorrect) cardStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200";
            else if (isSelected) cardStyle = "bg-rose-500/20 border-rose-500/50 text-rose-200";
            else cardStyle = "bg-slate-950/20 border-slate-900 text-slate-600 opacity-40";
          } else if (isSelected) {
            cardStyle = "bg-indigo-500/20 border-indigo-500/50 text-white";
          }

          return (
            <button
              key={idx}
              disabled={showFeedback}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center gap-6 ${cardStyle} ${!showFeedback && 'hover:bg-slate-800'}`}
            >
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-xs font-black ${isSelected ? 'border-current' : 'border-slate-700'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-semibold text-lg">{option}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mb-12 p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-2">Revelation</span>
          <p className="text-slate-300 text-base italic leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-end relative z-10">
        {!showFeedback ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs disabled:opacity-30"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-12 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs"
          >
            {currentIdx + 1 === quiz.questions.length ? 'Final Verdict' : 'Next Trial'}
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
