import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const PROTOCOL_COLORS = {
  TCP: '#0ea5e9',
  UDP: '#8b5cf6',
  HTTP: '#06b6d4',
  HTTPS: '#10b981',
  FTP: '#f59e0b',
  SSH: '#ec4899',
  DNS: '#6366f1',
  SMTP: '#f97316'
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner text="Computing Deep-Dive Traffic Visualizations..." />;
  }

  const protocolData = data?.protocolDistribution || [];
  const trafficData = data?.trafficTimeline || [];
  const trends = data?.trends || {
    daily: [],
    weekly: [],
    monthly: []
  };
  const topIPs = data?.topAttackingIPs || [];
  const topPorts = data?.topTargetPorts || [];

  const currentTrendData = activeTab === 'daily'
    ? trends.daily
    : activeTab === 'weekly'
    ? trends.weekly
    : trends.monthly;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            TRAFFIC <span className="text-cyan-400">VISUALIZATION & ANALYTICS</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Statistical behavioral distributions across transport protocols, temporal trends, and targeted attack surfaces
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 1. Protocol Distribution: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Counts Bar Chart - 2 Cols */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Protocol Event Volumes
              </h2>
              <p className="text-xs text-slate-400">Total packet frequency across 8 monitored protocols</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={protocolData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {protocolData.map((entry, index) => (
                    <Cell key={`proto-bar-${index}`} fill={PROTOCOL_COLORS[entry.name] || '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Ratio Pie Chart - 1 Col */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Protocol Share
              </h2>
              <p className="text-xs text-slate-400">Proportional composition</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded">
              Pie Chart
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="count"
                  paddingAngle={2}
                >
                  {protocolData.map((entry, index) => (
                    <Cell key={`proto-pie-${index}`} fill={PROTOCOL_COLORS[entry.name] || '#38bdf8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Temporal Alert Trends: Daily, Weekly, Monthly (Line & Bar Charts) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Temporal Intrusion Alert Trends
            </h2>
            <p className="text-xs text-slate-400">Daily, Weekly, and Monthly alert frequencies</p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded font-mono uppercase tracking-wider text-[11px] transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'daily' ? 'Daily Alerts' : tab === 'weekly' ? 'Weekly Alerts' : 'Monthly Alerts'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="alerts"
                name={`${activeTab.toUpperCase()} Alerts`}
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Network Traffic Volume Area Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Network Traffic Stream (Area Chart)
            </h2>
            <p className="text-xs text-slate-400">Total packet transmission stream vs anomaly occurrences</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
            Area Chart
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="total" name="Packet Traffic" stroke="#06b6d4" strokeWidth={2} fill="url(#areaTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Threat Surface Attack Targets: Top Attacking IPs & Targeted Ports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Attacking IPs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Top Attacking Source IPs
          </h3>
          <div className="space-y-2">
            {topIPs.length === 0 ? (
              <p className="text-xs text-slate-400">No attacker IPs isolated yet.</p>
            ) : (
              topIPs.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">{item.ip}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono font-bold">
                    {item.count} attacks
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Targeted Ports */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-amber-400" />
            Top Targeted Destination Ports
          </h3>
          <div className="space-y-2">
            {topPorts.length === 0 ? (
              <p className="text-xs text-slate-400">No targeted ports isolated yet.</p>
            ) : (
              topPorts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">{item.port}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
                    {item.count} hits
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
