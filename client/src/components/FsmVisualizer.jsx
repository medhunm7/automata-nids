import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Key, RefreshCw } from 'lucide-react';

const FsmVisualizer = ({ activeState = 'START', stateTrace = [], interactive = false, onStateSelect }) => {
  const states = [
    { id: 'START', label: 'START (q0)', sub: 'Baseline Idling', x: 70, y: 110, icon: ShieldCheck, color: 'blue' },
    { id: 'SYN_SENT', label: 'SYN_SENT (q1)', sub: 'Half-Open / Probe', x: 250, y: 50, icon: Activity, color: 'amber' },
    { id: 'CONNECTION', label: 'CONNECTION (q2)', sub: 'Session Bound', x: 430, y: 50, icon: RefreshCw, color: 'cyan' },
    { id: 'FAILED', label: 'FAILED (q3)', sub: 'Auth Denied', x: 250, y: 170, icon: Key, color: 'purple' },
    { id: 'ALERT', label: 'ALERT (qF)', sub: 'Threat Intercepted', x: 430, y: 170, icon: ShieldAlert, color: 'red' },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/80 border border-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Deterministic Finite Automaton (DFA) Architecture
          </span>
          <p className="text-xs text-slate-400">
            States: Q = &#123;START, SYN_SENT, CONNECTION, FAILED, ALERT&#125; | Final State: F = &#123;ALERT&#125;
          </p>
        </div>
        {activeState && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Current State:</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
              activeState === 'ALERT'
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                : activeState === 'START'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {activeState}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas for State Transition Diagram */}
      <div className="relative w-full aspect-[2.4/1] max-h-72">
        <svg viewBox="0 0 520 230" className="w-full h-full select-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Transitions Arrows */}
          {/* START -> SYN_SENT (SYN / PORT_SCAN) */}
          <path d="M 115 95 L 205 60" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
          <text x="145" y="70" fill="#94a3b8" fontSize="8" fontFamily="monospace">SYN / SCAN</text>

          {/* SYN_SENT self loop / SYN_SENT -> ALERT (3rd SYN or 4th SCAN) */}
          <path d="M 295 50 L 385 150" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
          <text x="345" y="95" fill="#f87171" fontSize="8" fontFamily="monospace">SYN[3] / SCAN[4]</text>

          {/* START -> CONNECTION (CONNECT) */}
          <path d="M 115 105 L 385 60" fill="none" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="230" y="90" fill="#94a3b8" fontSize="8" fontFamily="monospace">CONNECT</text>

          {/* CONNECTION <-> START (DISCONNECT) */}
          <path d="M 385 70 C 260 115 170 125 115 118" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          <text x="220" y="125" fill="#38bdf8" fontSize="8" fontFamily="monospace">DISCONNECT (Oscillation Cycle)</text>

          {/* CONNECTION -> ALERT (Oscillate cycle 5) */}
          <path d="M 430 85 L 430 135" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
          <text x="435" y="112" fill="#f87171" fontSize="8" fontFamily="monospace">CYCLE[5]</text>

          {/* START -> FAILED (LOGIN_FAIL) */}
          <path d="M 115 125 L 205 160" fill="none" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="135" y="155" fill="#c084fc" fontSize="8" fontFamily="monospace">LOGIN_FAIL</text>

          {/* FAILED -> ALERT (LOGIN_SUCCESS after 3 fails) */}
          <path d="M 295 170 L 385 170" fill="none" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
          <text x="310" y="163" fill="#f87171" fontSize="8" fontFamily="monospace">LOGIN_SUCCESS</text>

          {/* Render State Nodes */}
          {states.map((s) => {
            const isActive = activeState === s.id;
            const inTrace = stateTrace.includes(s.id);
            const isAlertNode = s.id === 'ALERT';

            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${s.y})`}
                className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:scale-105' : ''}`}
                onClick={() => interactive && onStateSelect && onStateSelect(s.id)}
              >
                {/* Outer halo when active */}
                {isActive && (
                  <circle
                    r="34"
                    fill="none"
                    stroke={isAlertNode ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Double boundary for accepting state (ALERT) */}
                {isAlertNode && (
                  <circle
                    r="30"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Main State Circle */}
                <circle
                  r="26"
                  fill={isActive ? (isAlertNode ? '#7f1d1d' : '#0e3b5e') : '#0f172a'}
                  stroke={
                    isActive
                      ? (isAlertNode ? '#ef4444' : '#38bdf8')
                      : inTrace
                      ? '#0284c7'
                      : '#334155'
                  }
                  strokeWidth={isActive ? '3' : '2'}
                  filter={isActive ? 'url(#glow-cyan)' : undefined}
                />

                {/* Node Label */}
                <text
                  textAnchor="middle"
                  y="-2"
                  fill={isActive ? '#ffffff' : inTrace ? '#38bdf8' : '#94a3b8'}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {s.id}
                </text>
                <text
                  textAnchor="middle"
                  y="9"
                  fill={isAlertNode ? '#fca5a5' : '#64748b'}
                  fontSize="6.5"
                  fontFamily="sans-serif"
                >
                  {s.id === 'ALERT' ? 'ACCEPT (F)' : s.id === 'START' ? 'INIT (q0)' : 'TRANSIT'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {stateTrace && stateTrace.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-slate-400 font-sans">Execution Trace:</span>
          {stateTrace.map((st, i) => (
            <React.Fragment key={i}>
              <span className={`px-2 py-0.5 rounded ${
                st === 'ALERT'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
              }`}>
                {st}
              </span>
              {i < stateTrace.length - 1 && <span className="text-cyan-500 font-bold">&rarr;</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default FsmVisualizer;
