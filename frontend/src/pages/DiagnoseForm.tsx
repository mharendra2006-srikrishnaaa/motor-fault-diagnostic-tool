import { useState } from 'react';
import { Play, RotateCcw, Download, AlertCircle, CheckCircle2, Scan } from 'lucide-react';
import { DiagnosticInput, DiagnosticResult } from '../types';
import { runDiagnosis, getReportUrl } from '../api';
import HealthGauge from '../components/HealthGauge';

interface DiagnoseFormProps {
  onDiagnosisComplete: (result: DiagnosticResult) => void;
}

const defaultInput: DiagnosticInput = {
  motor_power: 7.5,
  supply_voltage: 415,
  running_current: 14.0,
  temperature: 55,
  vibration_level: 2.5,
  power_factor: 0.88,
  operating_hours: 8,
};

interface FieldConfig {
  key: keyof DiagnosticInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const fields: FieldConfig[] = [
  { key: 'motor_power', label: 'Rated Power', unit: 'kW', min: 0.1, max: 1000, step: 0.1 },
  { key: 'supply_voltage', label: 'Supply Voltage', unit: 'V', min: 100, max: 11000, step: 1 },
  { key: 'running_current', label: 'Running Current', unit: 'A', min: 0.1, max: 2000, step: 0.1 },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 20, max: 200, step: 1 },
  { key: 'vibration_level', label: 'Vibration', unit: 'mm/s', min: 0, max: 50, step: 0.1 },
  { key: 'power_factor', label: 'Power Factor', unit: 'PF', min: 0.1, max: 1.0, step: 0.01 },
  { key: 'operating_hours', label: 'Daily Hours', unit: 'hrs', min: 1, max: 24, step: 0.5 },
];

export default function DiagnoseForm({ onDiagnosisComplete }: DiagnoseFormProps) {
  const [input, setInput] = useState<DiagnosticInput>(defaultInput);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof DiagnosticInput, value: string) => {
    setInput(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await runDiagnosis(input);
      setResult(res);
      onDiagnosisComplete(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostic scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput(defaultInput);
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-red-500/40 bg-red-500/5 text-red-400';
      case 'High': return 'border-orange-500/40 bg-orange-500/5 text-orange-400';
      case 'Medium': return 'border-amber-500/40 bg-amber-500/5 text-amber-400';
      default: return 'border-green-500/40 bg-green-500/5 text-green-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Scan className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-orbitron">
            Motor Parameters
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ key, label, unit, min, max, step }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1 tracking-wide">
                  {label} <span className="text-cyan-500/50">({unit})</span>
                </label>
                <input
                  type="number"
                  value={input[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  min={min}
                  max={max}
                  step={step}
                  required
                  className="input-futuristic w-full px-3 py-2.5 rounded-lg text-sm font-mono"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-futuristic flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm font-orbitron tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {loading ? 'SCANNING...' : 'RUN SCAN'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-slate-400 border border-slate-600/30 hover:border-slate-500/50 hover:text-slate-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Health Score */}
            <div className="glass-card p-6 text-center">
              <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
                Scan Result
              </h3>
              <HealthGauge score={result.health_score} category={result.health_category} size={200} />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                  <p className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Fault</p>
                  <p className="text-sm font-bold mt-1">{result.fault_detected}</p>
                </div>
                <div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                  <p className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Severity</p>
                  <p className="text-sm font-bold mt-1">{result.severity}</p>
                </div>
              </div>

              <a
                href={getReportUrl(result.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="font-orbitron text-xs tracking-wider">DOWNLOAD REPORT</span>
              </a>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-[10px] font-semibold text-slate-400 mb-4 uppercase tracking-[0.2em] font-orbitron">
                Maintenance Actions
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 rounded-full border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
              <Scan className="w-10 h-10 text-cyan-500/30" />
            </div>
            <h3 className="font-orbitron text-sm text-slate-300 tracking-wider">AWAITING SCAN</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
              Enter motor operating parameters and initiate diagnostic scan to receive fault analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
