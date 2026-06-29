import { useEffect, useState } from 'react';
import { Download, Trash2, Search, AlertTriangle, Database } from 'lucide-react';
import { DiagnosticResult } from '../types';
import { getHistory, deleteRecord, getReportUrl } from '../api';

export default function History() {
  const [records, setRecords] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterFault, setFilterFault] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setRecords(data);
      setError(null);
    } catch {
      setError('Failed to retrieve diagnostic logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this diagnostic record?')) return;
    try {
      await deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete record');
    }
  };

  const faultTypes = [...new Set(records.map(r => r.fault_detected))];

  const filtered = records.filter(r => {
    const matchesSearch = search === '' ||
      r.fault_detected.toLowerCase().includes(search.toLowerCase()) ||
      r.health_category.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toString().includes(search);
    const matchesFault = filterFault === '' || r.fault_detected === filterFault;
    return matchesSearch && matchesFault;
  });

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Excellent': 'bg-green-500/10 text-green-400 border-green-500/30',
      'Good': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      'Warning': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'Critical': 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      'Low': 'text-green-400',
      'Medium': 'text-amber-400',
      'High': 'text-orange-400',
      'Critical': 'text-red-400',
    };
    return colors[severity] || 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-cyan-400/60 font-orbitron tracking-widest">LOADING LOGS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center border-red-500/30">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-futuristic w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
          />
        </div>
        <select
          value={filterFault}
          onChange={e => setFilterFault(e.target.value)}
          className="input-futuristic px-3 py-2.5 rounded-lg text-sm"
        >
          <option value="">All Faults</option>
          {faultTypes.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">ID</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Date</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Power</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Score</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Fault</th>
                <th className="text-left px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Severity</th>
                <th className="text-right px-4 py-3 font-orbitron text-[10px] text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-400/60 text-xs">#{record.id}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{record.motor_power} kW</td>
                    <td className="px-4 py-3">
                      <span className="font-orbitron text-sm text-white">{record.health_score}</span>
                      <span className="text-slate-600 text-xs">/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getCategoryBadge(record.health_category)}`}>
                        {record.health_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs font-medium">{record.fault_detected}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${getSeverityBadge(record.severity)}`}>
                        {record.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={getReportUrl(record.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-cyan-500/10 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-orbitron tracking-wider">
            {filtered.length} OF {records.length} RECORDS
          </p>
          <div className="w-2 h-2 rounded-full bg-green-400/60 pulse-dot" />
        </div>
      </div>
    </div>
  );
}
