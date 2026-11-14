import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FsmVisualizer from '../components/FsmVisualizer';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [deleteModalAlert, setDeleteModalAlert] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        sortBy,
        sortOrder
      };
      const res = await api.get('/alerts', { params });
      if (res.data.success) {
        setAlerts(res.data.alerts);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalAlerts(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Fetch alerts error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, severityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/alerts/${id}`);
      if (res.data.success) {
        setActionMessage(`Alert removed successfully.`);
        setDeleteModalAlert(null);
        fetchAlerts();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error('Delete alert error:', err);
    }
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/alerts/export/csv`, '_blank');
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Toast message */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            SECURITY <span className="text-red-400">ALERTS CONSOLE</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time intrusion patterns and threat signatures intercepted by the Automata Engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by IP, Attack Type, Protocol, Port..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 text-xs transition-all focus:outline-none"
          />
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white text-xs cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white text-xs cursor-pointer focus:outline-none"
          >
            <option value="timestamp">Sort: Timestamp</option>
            <option value="severity">Sort: Severity</option>
            <option value="attackType">Sort: Attack Type</option>
            <option value="sourceIP">Sort: Source IP</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Retrieving Security Alert Records..." />
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No Alerts Found"
            description="No suspicious patterns match your query filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setSeverityFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSortToggle('alertId')}
                  >
                    Alert ID
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSortToggle('attackType')}
                  >
                    Attack Type
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSortToggle('severity')}
                  >
                    Severity
                  </th>
                  <th className="py-3 px-3">Source &rarr; Target</th>
                  <th className="py-3 px-3">Protocol / Port</th>
                  <th className="py-3 px-3">FSM State Trace</th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSortToggle('timestamp')}
                  >
                    Timestamp
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((alert) => (
                  <tr key={alert._id || alert.alertId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-cyan-400 font-bold whitespace-nowrap">
                      {alert.alertId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {alert.attackType}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <SeverityBadge severity={alert.severity} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      <span className="text-slate-200">{alert.sourceIP}</span>
                      <span className="text-slate-500 mx-1">&rarr;</span>
                      <span className="text-slate-400">{alert.destinationIP}</span>
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <span className="text-cyan-400">{alert.protocol}</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-slate-300">{alert.port}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {(alert.stateTrace || []).join(' → ')}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors"
                          title="View Forensic Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModalAlert(alert)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Dismiss Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <div>
            Showing {alerts.length} of {totalAlerts} total alerts
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-cyan-400">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Forensic Incident Report: ${selectedAlert.alertId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Classification:</span>
                <h4 className="text-base font-bold text-white">{selectedAlert.attackType}</h4>
              </div>
              <SeverityBadge severity={selectedAlert.severity} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Attacking Host:</span>
                <p className="text-cyan-400 font-bold">{selectedAlert.sourceIP}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Targeted Destination:</span>
                <p className="text-slate-200 font-bold">{selectedAlert.destinationIP}:{selectedAlert.port}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Protocol / Action:</span>
                <p className="text-slate-300">{selectedAlert.protocol} / {selectedAlert.action}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Detection Rule ID:</span>
                <p className="text-amber-400">{selectedAlert.ruleId || 'FSM Signature'}</p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-slate-300 mb-1 font-mono uppercase text-[11px]">
                Automata State Transition Trace:
              </h5>
              <FsmVisualizer activeState="ALERT" stateTrace={selectedAlert.stateTrace || ['START', 'ALERT']} />
            </div>

            <div>
              <h5 className="font-semibold text-slate-300 mb-1 font-mono uppercase text-[11px]">
                Pattern Analysis Description:
              </h5>
              <p className="p-3 rounded-lg bg-slate-950 text-slate-300 leading-relaxed border border-slate-800">
                {selectedAlert.description}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-emerald-400 mb-1 font-mono uppercase text-[11px]">
                Countermeasures & Recommended Action:
              </h5>
              <p className="p-3 rounded-lg bg-emerald-950/20 text-emerald-300 leading-relaxed border border-emerald-900/40">
                {selectedAlert.recommendedAction}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalAlert && (
        <Modal
          isOpen={!!deleteModalAlert}
          onClose={() => setDeleteModalAlert(null)}
          title="Confirm Alert Dismissal"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Dismiss Alert Record?</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Are you sure you want to remove alert <span className="font-mono text-white">{deleteModalAlert.alertId}</span>? This action deletes the alert from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalAlert(null)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalAlert._id || deleteModalAlert.alertId)}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-glow-danger"
              >
                Delete Alert
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Alerts;
