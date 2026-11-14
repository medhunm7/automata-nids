import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Target,
  Zap,
  ArrowUpRight,
  UploadCloud,
  FileText,
  Clock,
  Cpu,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import FsmVisualizer from '../components/FsmVisualizer';
import Modal from '../components/Modal';
import { exportReportPDF } from '../utils/exportPdf';

const COLORS = {
  TCP: '#0ea5e9',
  UDP: '#8b5cf6',
  HTTP: '#06b6d4',
  HTTPS: '#10b981',
  FTP: '#f59e0b',
  SSH: '#ec4899',
  DNS: '#6366f1',
  SMTP: '#f97316'
};

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#f59e0b',
  Low: '#06b6d4'
};

const Dashboard = ({ autoRefreshInterval }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        // Check for new alerts to trigger real-time notification
        if (data && res.data.recentAlerts?.length > 0) {
          const latestNew = res.data.recentAlerts[0];
          const latestOld = data.recentAlerts?.[0];
          if (latestOld && latestNew.alertId !== latestOld.alertId) {
            setToastAlert(latestNew);
            setTimeout(() => setToastAlert(null), 7000);
          }
        }
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Unable to connect to NIDS surveillance feed.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  // Auto-refresh interval listener
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchDashboardData]);

  if (loading && !data) {
    return <LoadingSpinner text="Synchronizing Telemetry Feeds with Automata Engine..." />;
  }

  const stats = data?.stats || {
    totalEvents: 0,
    safeEvents: 0,
    suspiciousEvents: 0,
    detectionAccuracy: 98.5,
    totalAlerts: 0,
  };

  const trafficData = data?.trafficTimeline || [];
  const protocolData = data?.protocolDistribution || [];
  const alertDistData = data?.alertDistribution || [];
  const recentAlerts = data?.recentAlerts || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Real-time Alert Toast Notification */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 border-2 border-red-500 shadow-glow-danger flex items-start gap-3 animate-bounce">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-red-400">
                🚨 Intrusion Detected: {toastAlert.attackType}
              </span>
              <SeverityBadge severity={toastAlert.severity} size="sm" />
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Source: <span className="font-mono text-cyan-400">{toastAlert.sourceIP}</span> &rarr; Port {toastAlert.port}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{toastAlert.description}</p>
          </div>
        </div>
      )}

      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            SURVEILLANCE <span className="text-cyan-400">DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time finite automata intrusion monitoring & anomaly correlation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Logs</span>
          </Link>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 text-xs font-medium transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>FSM Simulator</span>
          </Link>
          <button
            onClick={() => exportReportPDF({ stats, alerts: recentAlerts, protocolDistribution: protocolData })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events Analyzed"
          value={stats.totalEvents.toLocaleString()}
          subtitle="Packets ingested"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="Safe Events Verified"
          value={stats.safeEvents.toLocaleString()}
          subtitle="Baseline normal"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Suspicious Events"
          value={stats.suspiciousEvents.toLocaleString()}
          subtitle="Signature flagged"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Detection Accuracy"
          value={`${stats.detectionAccuracy}%`}
          subtitle="FSM DFA Precision"
          icon={Target}
          color="blue"
        />
      </div>

      {/* 2. Interactive Automata Engine State Diagram */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Automata State Machine (FSM) Engine Status
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            ● 4 Rules Online
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Incoming network packets traverse states <span className="font-mono text-cyan-300">START &rarr; SYN_SENT &rarr; CONNECTION &rarr; FAILED &rarr; ALERT</span> according to grammatical transition functions.
        </p>
        <FsmVisualizer activeState={recentAlerts.length > 0 ? recentAlerts[0].stateTrace?.[recentAlerts[0].stateTrace.length - 1] || 'START' : 'START'} stateTrace={recentAlerts[0]?.stateTrace || ['START']} />
      </div>

      {/* 3. Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Traffic Graph (Area Chart) - 2 Cols */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Network Traffic Telemetry
              </h2>
              <p className="text-xs text-slate-400">Total packet volume & anomaly distribution over time</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
              Temporal Window
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="total" name="Total Events" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="suspicious" name="Suspicious Flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSuspicious)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Distribution (Pie / Donut Chart) - 1 Col */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Protocol Distribution
              </h2>
              <p className="text-xs text-slate-400">Network protocol breakdown</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {protocolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#38bdf8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} layout="horizontal" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Second Row of Visualizations: Alert Distribution & Attack Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Severity Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Alerts By Severity
              </h2>
              <p className="text-xs text-slate-400">Critical, High, Medium, Low breakdown</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {alertDistData.map((entry, index) => (
                    <Cell key={`cell-sev-${index}`} fill={SEVERITY_COLORS[entry.name] || '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Type Distribution */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Detected Attack Classifications
              </h2>
              <p className="text-xs text-slate-400">Automata signature triggers across telemetry</p>
            </div>
            <Link to="/alerts" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View All Alerts <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attackTypeDistribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Recent Alerts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Recent Automata Security Alerts
            </h2>
            <p className="text-xs text-slate-400">Latest intrusion patterns flagged by the state machine</p>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Alerts Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <EmptyState
            title="Clean Perimeter"
            description="No suspicious intrusion alerts have been recorded yet."
            actionText="Simulate Sample Traffic"
            onAction={() => fetchDashboardData(false)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Alert ID</th>
                  <th className="py-3 px-3">Attack Type</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Source &rarr; Target</th>
                  <th className="py-3 px-3">Protocol / Port</th>
                  <th className="py-3 px-3">State Trace</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAlerts.map((alert) => (
                  <tr key={alert._id || alert.alertId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-cyan-400 font-medium">
                      {alert.alertId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {alert.attackType}
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={alert.severity} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <span className="text-slate-200">{alert.sourceIP}</span>
                      <span className="text-slate-500 mx-1">&rarr;</span>
                      <span className="text-slate-400">{alert.destinationIP}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-cyan-400">{alert.protocol}</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-slate-300">{alert.port}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {(alert.stateTrace || []).join(' → ')}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Incident Forensic Dossier: ${selectedAlert.alertId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-400">Attack Classification:</span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedAlert.attackType}</h4>
              </div>
              <SeverityBadge severity={selectedAlert.severity} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Originating IP:</span>
                <p className="text-cyan-400 font-bold">{selectedAlert.sourceIP}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Targeted Destination:</span>
                <p className="text-slate-200 font-bold">{selectedAlert.destinationIP}:{selectedAlert.port}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Transport Protocol:</span>
                <p className="text-slate-300">{selectedAlert.protocol}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Detection Rule:</span>
                <p className="text-amber-400">{selectedAlert.ruleId || 'FSM Signature'}</p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-slate-300 mb-1 font-mono uppercase text-[11px]">
                FSM Grammatical State Trace:
              </h5>
              <FsmVisualizer activeState="ALERT" stateTrace={selectedAlert.stateTrace || ['START', 'ALERT']} />
            </div>

            <div>
              <h5 className="font-semibold text-slate-300 mb-1 font-mono uppercase text-[11px]">
                Incident Forensic Description:
              </h5>
              <p className="p-3 rounded-lg bg-slate-950 text-slate-300 leading-relaxed border border-slate-800">
                {selectedAlert.description}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-emerald-400 mb-1 font-mono uppercase text-[11px]">
                Recommended Mitigation & Response:
              </h5>
              <p className="p-3 rounded-lg bg-emerald-950/20 text-emerald-300 leading-relaxed border border-emerald-900/40">
                {selectedAlert.recommendedAction}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
