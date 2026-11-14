import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccess('Authentication verified. Access granted.');
        setTimeout(() => navigate('/'), 600);
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to security gateway.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 cyber-grid relative">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-cyan-950/20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        {/* Branding Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-glow-cyan mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
            NIDS <span className="text-cyan-400">SURVEILLANCE</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Automata-Based Network Intrusion Detection Access Portal
          </p>
        </div>

        {/* Alerts / Error feedback */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Analyst Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@nids.local"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-600 text-sm transition-all focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-600 text-sm transition-all focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-xs">
          <p className="text-slate-400 font-mono text-[11px] mb-2 uppercase tracking-wide">
            One-Click Assessment Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofill('admin@nids.local', 'Admin@12345')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-left font-mono text-[11px] transition-colors"
            >
              👑 Admin (Full Access)
            </button>
            <button
              type="button"
              onClick={() => autofill('analyst@nids.local', 'Analyst@12345')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-blue-400 border border-slate-700 text-left font-mono text-[11px] transition-colors"
            >
              🛡️ Analyst Account
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Need an analyst identity?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register Operator
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
