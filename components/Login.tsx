
import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  language: 'en' | 'bn';
  setLanguage: React.Dispatch<React.SetStateAction<'en' | 'bn'>>;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage }) => {
  // Pre-fill credentials for easier access
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Demo Authentication Logic
    setTimeout(() => {
      if (email === 'admin@royal.com' && password === 'admin123') {
        onLogin({ id: '1', name: 'Mr. Royal', email: 'admin@royal.com', role: 'OWNER' });
      } else if (email === 'staff@royal.com' && password === 'staff123') {
        onLogin({ id: '2', name: 'Staff Member', email: 'staff@royal.com', role: 'STAFF' });
      } else {
        setError(language === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid email or password');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden ${language === 'bn' ? 'lang-bn' : ''}`}>
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
          className="bg-white/50 backdrop-blur-md border border-white/20 p-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all shadow-sm"
        >
          {language === 'en' ? 'বাংলা' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-slate-900 dark:bg-slate-100 rounded-3xl shadow-2xl mb-6 text-white dark:text-slate-900">
            <Boxes size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none uppercase">
            Royal<span className="text-blue-600">Auto</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-3 flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="text-blue-500" />
            Secure Inventory Access
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royal.com"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-semibold text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-semibold text-black"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold text-center border border-rose-100 dark:border-rose-800">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-xl hover:shadow-slate-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Please sign in with your authorized credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
