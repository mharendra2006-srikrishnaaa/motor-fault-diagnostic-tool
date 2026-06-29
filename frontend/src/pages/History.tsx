import { useEffect, useState } from 'react';
import { Download, Trash2, Search, AlertTriangle } from 'lucide-react';
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
    } catch (err) {
      setError('Failed to load history. Ensure the backend is running.');
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
      'Excellent': 'bg-emerald-100 text-emerald-700',
      'Good': 'bg-blue-100 text-blue-700',
      'Warning': 'bg-amber-100 text-amber-700',
      'Critical': 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-100 text-green-700',
      'Medium': 'bg-amber-100 text-amber-700',
      'High': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700',
    };
    return colors[severity] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, fault, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={filterFault}
          onChange={e => setFilterFault(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">All Faults</option>
          {faultTypes.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Power</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Score</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fault</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Severity</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No diagnostic records found
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">#{record.id}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.motor_power} kW</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">{record.health_score}</span>
                      <span className="text-slate-400">/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(record.health_category)}`}>
                        {record.health_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{record.fault_detected}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(record.severity)}`}>
                        {record.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getReportUrl(record.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          Showing {filtered.length} of {records.length} records
        </div>
      </div>
    </div>
  );
}
