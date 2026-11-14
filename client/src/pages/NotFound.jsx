import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-center cyber-grid relative">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4 shadow-glow-danger">
        <ShieldAlert className="w-16 h-16 animate-pulse" />
      </div>

      <h1 className="text-6xl font-bold font-mono text-white tracking-widest">
        404
      </h1>
      <h2 className="text-xl font-bold font-mono text-cyan-400 mt-2">
        RESOURCE_NOT_FOUND
      </h2>
      <p className="mt-2 text-xs text-slate-400 max-w-md font-sans">
        The requested surveillance telemetry route or resource is outside the perimeter boundary of this intrusion detection node.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-glow-cyan"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
