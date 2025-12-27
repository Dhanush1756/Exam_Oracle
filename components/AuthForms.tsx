
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthForms: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = isLogin 
        ? await authService.login(email, password)
        : await authService.signup(email, password, name);
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 glass-card rounded-3xl animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-2xl bg-indigo-500/10 mb-4">
          <Sparkles className="text-indigo-400 w-8 h-8" />
        </div>
        <h2 className="oracle-title text-3xl text-white mb-2">
          {isLogin ? 'Welcome Back, Scholar' : 'Join the Inner Circle'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isLogin ? 'Enter your credentials to continue your quest.' : 'Start your journey to academic enlightenment.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="email"
            placeholder="Scroll Address (Email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="password"
            placeholder="Secret Key (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {error && (
          <p className="text-rose-400 text-xs italic bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? 'Consulting the Archive...' : isLogin ? 'Enter Library' : 'Begin Quest'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          {isLogin ? "New scholar? Sign up here." : "Already an initiate? Log in here."}
        </button>
      </div>
    </div>
  );
};
