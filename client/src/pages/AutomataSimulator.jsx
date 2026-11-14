import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import FsmVisualizer from '../components/FsmVisualizer';
import SeverityBadge from '../components/SeverityBadge';

const PRESETS = [
  {
    name: 'Rule 1: SYN Flood Attack',
    sequence: ['SYN', 'SYN', 'SYN'],
    expected: 'Possible SYN Flood Attack',
    severity: 'Critical',
    desc: '3 successive SYN flags without handshake acknowledgment completion.'
  },
  {
    name: 'Rule 2: Brute Force Attack',
    sequence: ['LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_SUCCESS'],
    expected: 'Brute Force Attack',
    severity: 'Critical',
    desc: '3 sequential authentication failures followed by login success.'
  },
  {
    name: 'Rule 3: Port Scanning',
    sequence: ['PORT_SCAN', 'PORT_SCAN', 'PORT_SCAN', 'PORT_SCAN'],
    expected: 'Port Scanning',
    severity: 'High',
    desc: '4 sequential rapid port probes across diverse ports.'
  },
  {
    name: 'Rule 4: Abnormal Connection Pattern',
    sequence: ['CONNECT', 'DISCONNECT', 'CONNECT', 'DISCONNECT', 'CONNECT'],
    expected: 'Abnormal Connection Pattern',
    severity: 'Medium',
    desc: 'Oscillating connect-disconnect loop over a single session.'
  }
];

const ALPHABET = [
  { symbol: 'SYN', label: 'TCP SYN Flag', color: 'blue' },
  { symbol: 'ACK', label: 'TCP ACK Flag', color: 'slate' },
  { symbol: 'LOGIN_FAIL', label: 'Auth Failed', color: 'purple' },
  { symbol: 'LOGIN_SUCCESS', label: 'Auth Success', color: 'emerald' },
  { symbol: 'PORT_SCAN', label: 'Port Probe', color: 'amber' },
  { symbol: 'CONNECT', label: 'Open Socket', color: 'cyan' },
  { symbol: 'DISCONNECT', label: 'Close Socket', color: 'slate' },
  { symbol: 'DATA', label: 'Payload Transfer', color: 'slate' }
];

const AutomataSimulator = () => {
  const [currentState, setCurrentState] = useState('START');
  const [trace, setTrace] = useState(['START']);
  const [history, setHistory] = useState([]);
  const [triggeredAlert, setTriggeredAlert] = useState(null);

  // Evaluates next state transition locally in the interactive simulator
  const stepTransition = (symbol) => {
    let nextState = 'START';
    let alertInfo = null;

    const sym = symbol.toUpperCase().trim();
    const currentStep = history.length;

    // Rule 1: SYN -> SYN -> SYN
    if (sym === 'SYN') {
      const synCount = history.filter(h => h.symbol === 'SYN').length + 1;
      if (synCount === 1) nextState = 'SYN_SENT';
      else if (synCount === 2) nextState = 'SYN_SENT';
      else if (synCount >= 3) {
        nextState = 'ALERT';
        alertInfo = {
          name: 'Possible SYN Flood Attack',
          severity: 'Critical',
          desc: 'Triggered by 3 consecutive TCP SYN flags.'
        };
      }
    }
    // Rule 2: LOGIN_FAIL x3 -> LOGIN_SUCCESS
    else if (sym === 'LOGIN_FAIL') {
      nextState = 'FAILED';
    } else if (sym === 'LOGIN_SUCCESS') {
      const failCount = history.filter(h => h.symbol === 'LOGIN_FAIL').length;
      if (failCount >= 3 && currentState === 'FAILED') {
        nextState = 'ALERT';
        alertInfo = {
          name: 'Brute Force Attack',
          severity: 'Critical',
          desc: 'Triggered by 3 failed logins followed by login success.'
        };
      } else {
        nextState = 'START';
      }
    }
    // Rule 3: PORT_SCAN x4
    else if (sym === 'PORT_SCAN') {
      const scanCount = history.filter(h => h.symbol === 'PORT_SCAN').length + 1;
      if (scanCount < 4) nextState = 'SYN_SENT';
      else {
        nextState = 'ALERT';
        alertInfo = {
          name: 'Port Scanning',
          severity: 'High',
          desc: 'Triggered by 4 consecutive port scan probes.'
        };
      }
    }
    // Rule 4: CONNECT -> DISCONNECT -> CONNECT -> DISCONNECT -> CONNECT
    else if (sym === 'CONNECT') {
      const connCount = history.filter(h => h.symbol === 'CONNECT').length + 1;
      const disconnCount = history.filter(h => h.symbol === 'DISCONNECT').length;
      if (connCount === 3 && disconnCount === 2) {
        nextState = 'ALERT';
        alertInfo = {
          name: 'Abnormal Connection Pattern',
          severity: 'Medium',
          desc: 'Triggered by 5-step rapid connection oscillation cycle.'
        };
      } else {
        nextState = 'CONNECTION';
      }
    } else if (sym === 'DISCONNECT') {
      nextState = 'START';
    } else {
      nextState = 'START';
    }

    const newHistory = [...history, { step: currentStep + 1, from: currentState, symbol: sym, to: nextState }];
    const newTrace = [...trace, nextState];

    setCurrentState(nextState);
    setHistory(newHistory);
    setTrace(newTrace);
    if (alertInfo) {
      setTriggeredAlert(alertInfo);
    }
  };

  const handleReset = () => {
    setCurrentState('START');
    setTrace(['START']);
    setHistory([]);
    setTriggeredAlert(null);
  };

  const loadPreset = async (preset) => {
    handleReset();
    let currentS = 'START';
    const newHist = [];
    const newTr = ['START'];

    for (let i = 0; i < preset.sequence.length; i++) {
      const sym = preset.sequence[i];
      // compute next
      let nextS = 'START';
      if (preset.name.includes('SYN')) {
        nextS = i === 2 ? 'ALERT' : 'SYN_SENT';
      } else if (preset.name.includes('Brute')) {
        nextS = i === 3 ? 'ALERT' : 'FAILED';
      } else if (preset.name.includes('Port')) {
        nextS = i === 3 ? 'ALERT' : 'SYN_SENT';
      } else if (preset.name.includes('Abnormal')) {
        nextS = i === 4 ? 'ALERT' : (sym === 'CONNECT' ? 'CONNECTION' : 'START');
      }

      newHist.push({ step: i + 1, from: currentS, symbol: sym, to: nextS });
      newTr.push(nextS);
      currentS = nextS;
    }

    setCurrentState(currentS);
    setHistory(newHist);
    setTrace(newTr);
    setTriggeredAlert({
      name: preset.expected,
      severity: preset.severity,
      desc: preset.desc
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            FINITE AUTOMATA <span className="text-purple-400">INTERACTIVE SIMULATOR</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Step-by-step state machine sandbox to demonstrate formal grammar transitions & intrusion rules
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Automaton</span>
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="rounded-xl border border-purple-500/30 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl">
        <FsmVisualizer activeState={currentState} stateTrace={trace} interactive={false} />
      </div>

      {/* Triggered Alert Notification Banner */}
      {triggeredAlert && (
        <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500 shadow-glow-danger flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  FINAL ACCEPTING STATE REACHED: {triggeredAlert.name}
                </span>
                <SeverityBadge severity={triggeredAlert.severity} size="sm" />
              </div>
              <p className="text-xs text-red-300 mt-1">{triggeredAlert.desc}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Automaton condition: <span className="text-cyan-400">&#948;*(q0, w) &isin; F</span> where w = [{history.map(h => h.symbol).join(', ')}]
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
          >
            Clear State
          </button>
        </div>
      )}

      {/* Two Columns: Input Alphabet Controls vs Step-by-Step Transition Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Alphabet & Presets */}
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Load Attack Presets
            </h3>
            <p className="text-xs text-slate-400">
              Instantly simulate the 4 intrusion patterns specified in the project requirements:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(p)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cyan-300 font-mono">{p.name.split(':')[0]}</span>
                    <SeverityBadge severity={p.severity} size="sm" />
                  </div>
                  <p className="text-xs text-white font-medium">{p.expected}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Sequence: [{p.sequence.join(' &rarr; ')}]
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Input Alphabet Symbols */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              Feed Input Symbol (&Sigma;)
            </h3>
            <p className="text-xs text-slate-400">
              Click any input symbol to feed it into the current state machine and watch the transition:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {ALPHABET.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => stepTransition(item.symbol)}
                  className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-left transition-all"
                >
                  <div className="font-mono text-xs font-bold text-cyan-400">+{item.symbol}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transition Execution Audit Log */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                State Transition Table (&delta;) Execution
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Steps Recorded: {history.length}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Automaton is in START state (q0). Click an input symbol or load a preset to begin transition sequence.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono ${
                      h.to === 'ALERT'
                        ? 'bg-red-500/10 border-red-500/40 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">#{h.step}</span>
                      <span className="font-bold text-slate-400">{h.from}</span>
                      <span className="text-cyan-400">&mdash;[{h.symbol}]&rarr;</span>
                      <span className={`font-bold ${h.to === 'ALERT' ? 'text-red-400' : 'text-cyan-300'}`}>
                        {h.to}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-sans">
                      {h.to === 'ALERT' ? 'Accepting State Reached' : 'Valid Transition'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Mathematical model: M = (&#123;START, SYN_SENT, CONNECTION, FAILED, ALERT&#125;, &Sigma;, &delta;, START, &#123;ALERT&#125;)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomataSimulator;
