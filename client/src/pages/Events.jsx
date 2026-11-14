import React, { useState, useEffect, useCallback } from 'react';
import {
  ListTree,
  Search,
  Filter,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Send,
  RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Manual Packet Injection modal
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [injectForm, setInjectForm] = useState({
    sourceIP: '192.168.1.150',
    destinationIP: '10.0.0.1',
    protocol: 'TCP',
    port: '80',
    action: 'SYN'
  });
  const [injectLoading, setInjectLoading] = useState(false);
  const [injectMessage, setInjectMessage] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        protocol: protocolFilter !== 'ALL' ? protocolFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      };
      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.events);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalEvents(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, protocolFilter, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleInjectPacket = async (e) => {
    e.preventDefault();
    setInjectLoading(true);
    setInjectMessage(null);
    try {
      const res = await api.post('/events/simulate', injectForm);
      if (res.data.success) {
        setInjectMessage({
          type: res.data.alerts?.length > 0 ? 'ALERT' : 'SUCCESS',
          text: res.data.alerts?.length > 0
            ? `🚨 Packet triggered Automata ALERT: ${res.data.alerts[0].attackType}!`
            : `✅ Packet processed safely. Resulting FSM State: ${res.data.event.fsmState}`
        });
        fetchEvents();
      }
    } catch (err) {
      setInjectMessage({ type: 'ERROR', text: err.response?.data?.message || 'Injection failed' });
    } finally {
      setInjectLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            NETWORK <span className="text-cyan-400">EVENTS AUDIT STREAM</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Full telemetry log repository with deterministic state annotations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsInjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inject Test Packet</span>
          </button>
        </div>
      </div>

      {/* Filters / Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by IP, Action, Protocol..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 text-xs transition-all focus:outline-none"
          />
        </div>

        <div>
          <select
            value={protocolFilter}
            onChange={(e) => {
              setProtocolFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white text-xs cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="HTTP">HTTP</option>
            <option value="HTTPS">HTTPS</option>
            <option value="SSH">SSH</option>
            <option value="FTP">FTP</option>
            <option value="DNS">DNS</option>
            <option value="SMTP">SMTP</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white text-xs cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SAFE">SAFE Baseline</option>
            <option value="SUSPICIOUS">SUSPICIOUS Flagged</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Querying Network Event Audit Records..." />
        ) : events.length === 0 ? (
          <EmptyState
            title="No Network Events Found"
            description="No events match your current filter criteria."
            actionText="Reset Filters"
            onAction={() => {
              setSearch('');
              setProtocolFilter('ALL');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Source IP</th>
                  <th className="py-3 px-3">Destination IP</th>
                  <th className="py-3 px-3">Protocol</th>
                  <th className="py-3 px-3">Port</th>
                  <th className="py-3 px-3">Action Symbol (&Sigma;)</th>
                  <th className="py-3 px-3">FSM State (Q)</th>
                  <th className="py-3 px-3">Alert Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {events.map((evt) => (
                  <tr key={evt._id || evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {evt.status === 'SUSPICIOUS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                          <ShieldAlert className="w-3 h-3" />
                          SUSPICIOUS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          SAFE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                      {evt.sourceIP}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {evt.destinationIP}
                    </td>
                    <td className="py-3 px-3 text-purple-400 font-bold whitespace-nowrap">
                      {evt.protocol}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {evt.port}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        evt.fsmState === 'ALERT'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : evt.fsmState === 'START'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {evt.fsmState || 'START'}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {evt.alertTriggered ? (
                        <span className="text-red-400 font-bold">{evt.alertTriggered}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <div>
            Showing {events.length} of {totalEvents} total network events
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

      {/* Manual Packet Injection Modal */}
      {isInjectModalOpen && (
        <Modal
          isOpen={isInjectModalOpen}
          onClose={() => {
            setIsInjectModalOpen(false);
            setInjectMessage(null);
          }}
          title="Inject Test Packet into Automata Engine"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleInjectPacket} className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Feed an individual network communication event into the live Finite Automata Engine to observe state transition in real-time.
            </p>

            {injectMessage && (
              <div className={`p-3 rounded-lg border text-xs ${
                injectMessage.type === 'ALERT'
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : injectMessage.type === 'SUCCESS'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}>
                {injectMessage.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Source IP</label>
                <input
                  type="text"
                  value={injectForm.sourceIP}
                  onChange={(e) => setInjectForm({ ...injectForm, sourceIP: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-mono mb-1">Destination IP</label>
                <input
                  type="text"
                  value={injectForm.destinationIP}
                  onChange={(e) => setInjectForm({ ...injectForm, destinationIP: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Protocol</label>
                <select
                  value={injectForm.protocol}
                  onChange={(e) => setInjectForm({ ...injectForm, protocol: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="HTTP">HTTP</option>
                  <option value="HTTPS">HTTPS</option>
                  <option value="SSH">SSH</option>
                  <option value="DNS">DNS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Port</label>
                <input
                  type="number"
                  value={injectForm.port}
                  onChange={(e) => setInjectForm({ ...injectForm, port: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Action Symbol</label>
                <select
                  value={injectForm.action}
                  onChange={(e) => setInjectForm({ ...injectForm, action: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                >
                  <option value="SYN">SYN</option>
                  <option value="ACK">ACK</option>
                  <option value="LOGIN_FAIL">LOGIN_FAIL</option>
                  <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                  <option value="PORT_SCAN">PORT_SCAN</option>
                  <option value="CONNECT">CONNECT</option>
                  <option value="DISCONNECT">DISCONNECT</option>
                  <option value="DATA">DATA</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInjectModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={injectLoading}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-glow-cyan"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Packet</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Events;
