import React from 'react';
import { Shield, Sun, Moon, RefreshCw, LogOut, User, Radio, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ autoRefreshInterval, setAutoRefreshInterval, onRefreshNow, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger + Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-glow-cyan">
              <Shield className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white font-mono text-sm sm:text-base">
                  AUTOMATA <span className="text-cyan-400">NIDS</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                  FSM ENGINE v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
                Network Intrusion Detection System
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Sensor Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Sensor Status:</span>
            <span className="font-mono text-emerald-400 font-medium">LIVE MONITORING</span>
          </div>

          {/* Auto Refresh Control */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={onRefreshNow}
              title="Manual Refresh"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value={0} className="bg-slate-900 text-slate-200">Auto: OFF</option>
              <option value={5000} className="bg-slate-900 text-slate-200">Auto: 5s</option>
              <option value={10000} className="bg-slate-900 text-slate-200">Auto: 10s</option>
              <option value={30000} className="bg-slate-900 text-slate-200">Auto: 30s</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono capitalize">{user.role || 'Analyst'}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
