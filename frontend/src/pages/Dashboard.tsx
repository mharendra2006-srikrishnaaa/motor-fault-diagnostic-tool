import { useEffect, useState } from 'react';
import { Activity, Zap, Thermometer, AlertTriangle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Stats, DiagnosticResult } from '../types';
import { getStats } from '../api';
import HealthGauge from '../components/HealthGauge';
import StatusCard from '../components/StatusCard';

interface DashboardProps {
  lastResult: DiagnosticResult | null;
}

const PIE_COLORS = ['#00ff88', '#00f0ff', '#ffaa00', '#ff3366', '#7c3aed', '#0891b2', '#f472b6'];

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
    } catch {
      setError('Failed to connect to diagnostic server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-cyan-400/60 font-orbitron tracking-widest">LOADING DATA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center border-red-500/30">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-semibold font-orbitron text-sm">{error}</p>
        <p className="text-slate-500 text-xs mt-2">Ensure the FastAPI backend is running on port 8000</p>
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
      {/* Motor image banner */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80"
            alt="Industrial motor"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="font-orbitron text-lg text-white tracking-wider">MOTOR HEALTH MONITORING</h3>
            <p className="text-slate-400 text-sm mt-1">Predictive Maintenance System • Real-time Analysis</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Protected</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Scans"
          value={stats.total_diagnostics}
          subtitle="Diagnostics performed"
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
        />
        <StatusCard
          title="Avg Health"
          value={`${stats.average_health_score}%`}
          subtitle="Fleet average"
          icon={<Zap className="w-5 h-5" />}
          color="green"
        />
        <StatusCard
          title="Fault Types"
          value={Object.keys(stats.fault_distribution).length}
          subtitle="Unique conditions"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatusCard
          title="Latest Fault"
          value={lastResult?.fault_detected ?? 'N/A'}
          subtitle={lastResult ? `Severity: ${lastResult.severity}` : 'Run a scan'}
          icon={<Thermometer className="w-5 h-5" />}
          color={lastResult?.severity === 'Critical' ? 'red' : 'purple'}
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
            Motor Health Index
          </h3>
          <HealthGauge score={latestScore} category={latestCategory} size={230} />
          {lastResult && (
            <p className="text-[10px] text-slate-500 mt-4 font-orbitron">
              SCAN: {new Date(lastResult.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Health Trend Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
            Health Score Trend
          </h3>
          {stats.recent_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.recent_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.05)" />
                <XAxis
                  dataKey="id"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: 'rgba(0, 240, 255, 0.1)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: 'rgba(0, 240, 255, 0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontFamily: 'Rajdhani',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Health Score']}
                />
                <Line
                  type="monotone"
                  dataKey="health_score"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  dot={{ fill: '#00f0ff', r: 3, stroke: '#00f0ff', strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: '#00f0ff', stroke: 'rgba(0, 240, 255, 0.3)', strokeWidth: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
              No trend data. Run a diagnosis to begin.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fault Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
            Fault Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-slate-500 text-sm">
              No fault data
            </div>
          )}
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-slate-400 truncate">{item.name}</span>
                <span className="text-slate-500 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card p-6">
          <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
            Latest Recommendations
          </h3>
          {lastResult ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {lastResult.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                  <span className="text-cyan-400 font-orbitron text-xs font-bold mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-slate-300">{rec}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Zap className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Run a diagnostic scan</p>
              <p className="text-xs text-slate-600">to see recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
