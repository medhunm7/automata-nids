import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SeverityBadge from '../components/SeverityBadge';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selected) => {
    setError(null);
    setResult(null);
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt', 'json'].includes(ext)) {
      setError('Unsupported file type. Please provide a CSV, TXT, or JSON file.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a log file to ingest.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error occurred while processing log file.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = (format) => {
    window.open(`${api.defaults.baseURL}/events/download/sample/${format}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
          INGEST <span className="text-cyan-400">NETWORK LOGS</span>
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Upload packet captures or audit logs in CSV, TXT, or JSON format for automated FSM state analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl">
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragging
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : file
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-cyan-500/50 bg-slate-950/50'
                }`}
                onClick={() => document.getElementById('logFileInput').click()}
              >
                <input
                  id="logFileInput"
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 mb-3 shadow-glow-cyan">
                  {file ? <FileCheck className="w-8 h-8 text-emerald-400" /> : <UploadCloud className="w-8 h-8" />}
                </div>

                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-400 font-mono">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready for Automata ingestion</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Drag & drop network traffic file here</p>
                    <p className="text-xs text-slate-400 mt-1">Accepts CSV, TXT, or JSON log records</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Finite Automata Transitions...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Analyze Logs with FSM Engine</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {result && (
            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Log Analysis Completed Successfully</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">{result.batchId}</span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Total Packets</span>
                  <p className="text-lg font-bold text-white font-mono mt-0.5">{result.summary.totalUploaded}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Safe Events</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{result.summary.safeEvents}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Suspicious</span>
                  <p className="text-lg font-bold text-red-400 font-mono mt-0.5">{result.summary.suspiciousEvents}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</span>
                  <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">{result.summary.detectionAccuracy}%</p>
                </div>
              </div>

              {/* Detected Alerts in batch */}
              {result.alerts && result.alerts.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold mb-2">
                    🚨 Intrusions Intercepted in Batch ({result.alerts.length}):
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {result.alerts.map((alt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-red-500/20 text-xs">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={alt.severity} size="sm" />
                          <span className="font-semibold text-white">{alt.attackType}</span>
                          <span className="text-slate-400 font-mono">({alt.sourceIP} &rarr; Port {alt.port})</span>
                        </div>
                        <span className="font-mono text-cyan-400 text-[11px]">
                          {(alt.stateTrace || []).join(' → ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Link
                      to="/alerts"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
                    >
                      <span>Open in Alerts Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Format Specs & Download Samples */}
        <div className="space-y-6">
          {/* Format Guide */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Log Format Specifications
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each network log record must supply 6 standardized attributes:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
              <div>1. Timestamp (YYYY-MM-DD HH:mm:ss)</div>
              <div>2. Source IP (e.g. 192.168.1.10)</div>
              <div>3. Destination IP (e.g. 8.8.8.8)</div>
              <div>4. Protocol (TCP, UDP, HTTP, SSH, etc.)</div>
              <div>5. Port (e.g. 80, 22, 443)</div>
              <div>6. Action (SYN, LOGIN_FAIL, PORT_SCAN, etc.)</div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Example Record:</span>
              <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-cyan-900/40 font-mono text-[11px] text-slate-300 overflow-x-auto">
2026-11-10 10:12:00,192.168.1.10,8.8.8.8,TCP,80,SYN
              </pre>
            </div>
          </div>

          {/* Download Sample Data */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Download Sample Datasets
            </h3>
            <p className="text-xs text-slate-400">
              Download pre-generated network traffic logs (100 legitimate events + 20 attack patterns) for immediate assessment testing:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => downloadSample('csv')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
              >
                <span className="font-mono text-cyan-400">sample_traffic.csv</span>
                <span className="text-[11px] text-slate-500">CSV Format</span>
              </button>

              <button
                onClick={() => downloadSample('json')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
              >
                <span className="font-mono text-purple-400">sample_traffic.json</span>
                <span className="text-[11px] text-slate-500">JSON Format</span>
              </button>

              <button
                onClick={() => downloadSample('txt')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
              >
                <span className="font-mono text-amber-400">sample_traffic.txt</span>
                <span className="text-[11px] text-slate-500">Raw Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
