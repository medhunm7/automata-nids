import React from 'react';
import { Shield } from 'lucide-react';

const LoadingSpinner = ({ text = 'Analyzing Telemetry Data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
      </div>
      <p className="text-sm font-mono text-cyan-400/80 tracking-wider animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
