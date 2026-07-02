import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, Mail, Loader, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false); // local loading state
  const { login, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || submitting) return;
    setSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0817] via-[#140e28] to-[#1e133c] p-6">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[#2e254f] bg-[#18132b]/80 backdrop-blur-md shadow-glass">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-teal-400">
            InternPortal
          </h1>
          <p className="text-sm text-brand-muted mt-2">Sign in to your collaboration workspace</p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-brand-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="intern@portal.com"
                disabled={submitting}
                className="w-full pl-11 pr-4 py-3 bg-[#0f0a1c] border border-[#2e254f] hover:border-brand-purple focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-brand-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full pl-11 pr-11 py-3 bg-[#0f0a1c] border border-[#2e254f] hover:border-brand-purple focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-brand-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-indigo hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick login hints for development */}
        <div className="mt-6 p-3 rounded-xl bg-[#0f0a1c]/60 border border-[#2e254f] text-xs text-brand-muted space-y-1">
          <p className="font-semibold text-slate-400 mb-2">🔑 Demo Credentials (pass: Password@123)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <button type="button" onClick={() => { setEmail('intern1@portal.com'); setPassword('Password@123'); }} className="text-left hover:text-brand-teal transition-colors truncate">→ intern1@portal.com</button>
            <button type="button" onClick={() => { setEmail('mentor@portal.com'); setPassword('Password@123'); }} className="text-left hover:text-brand-teal transition-colors truncate">→ mentor@portal.com</button>
            <button type="button" onClick={() => { setEmail('admin@portal.com'); setPassword('Password@123'); }} className="text-left hover:text-brand-teal transition-colors truncate">→ admin@portal.com</button>
            <button type="button" onClick={() => { setEmail('hr@portal.com'); setPassword('Password@123'); }} className="text-left hover:text-brand-teal transition-colors truncate">→ hr@portal.com</button>
          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-xs text-brand-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-teal hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
