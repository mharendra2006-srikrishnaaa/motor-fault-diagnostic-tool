import { useEffect, useState } from 'react';
import { Activity, Zap, Thermometer, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Stats, DiagnosticResult } from '../types';
import { getStats } from '../api';
import HealthGauge from '../components/HealthGauge';
import StatusCard from '../components/StatusCard';

interface DashboardProps {
  lastResult: DiagnosticResult | null;
}

const PIE_COLORS = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d'];

export default function Dashboard({ lastResult }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [lastResult]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
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
        <p className="text-red-500 text-sm mt-1">Make sure the FastAPI backend is running on port 8000</p>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = Object.entries(stats.fault_distribution).map(([name, value]) => ({
    name,
    value,
  }));

  const latestScore = lastResult?.health_score ?? Math.round(stats.average_health_score);
  const latestCategory = lastResult?.health_category ?? (
    latestScore >= 90 ? 'Excellent' : latestScore >= 75 ? 'Good' : latestScore >= 50 ? 'Warning' : 'Critical'
  );

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Diagnostics"
          value={stats.total_diagnostics}
          subtitle="Analyses performed"
          icon={<Activity className="w-5 h-5" />}
          color="blue"
        />
        <StatusCard
          title="Avg Health Score"
          value={`${stats.average_health_score}%`}
          subtitle="Across all tests"
          icon={<Zap className="w-5 h-5" />}
          color="green"
        />
        <StatusCard
          title="Fault Types"
          value={Object.keys(stats.fault_distribution).length}
          subtitle="Unique conditions detected"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatusCard
          title="Latest Fault"
          value={lastResult?.fault_detected ?? 'N/A'}
          subtitle={lastResult ? `Severity: ${lastResult.severity}` : 'Run a diagnosis'}
          icon={<Thermometer className="w-5 h-5" />}
          color={lastResult?.severity === 'Critical' ? 'red' : 'slate'}
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Motor Health Score</h3>
          <HealthGauge score={latestScore} category={latestCategory} size={220} />
          {lastResult && (
            <p className="text-xs text-slate-400 mt-3">
              Last diagnosis: {new Date(lastResult.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Health Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Health Score Trend</h3>
          {stats.recent_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.recent_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="id"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ value: 'Diagnosis #', position: 'bottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`${value}%`, 'Health Score']}
                />
                <Line
                  type="monotone"
                  dataKey="health_score"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400">
              No data yet. Run a diagnosis to see trends.
            </div>
          )}
        </div>
      </div>

      {/* Fault Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Fault Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400">
              No fault data available
            </div>
          )}
        </div>

        {/* Last Result Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
            Latest Recommendations
          </h3>
          {lastResult ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {lastResult.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-700 p-2 bg-slate-50 rounded-lg">
                  <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400">
              Run a diagnosis to see recommendations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
