import { useState } from 'react';
import { Play, RotateCcw, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  { key: 'motor_power', label: 'Motor Rated Power', unit: 'kW', min: 0.1, max: 1000, step: 0.1 },
  { key: 'supply_voltage', label: 'Supply Voltage', unit: 'V', min: 100, max: 11000, step: 1 },
  { key: 'running_current', label: 'Running Current', unit: 'A', min: 0.1, max: 2000, step: 0.1 },
  { key: 'temperature', label: 'Motor Temperature', unit: '°C', min: 20, max: 200, step: 1 },
  { key: 'vibration_level', label: 'Vibration Level', unit: 'mm/s', min: 0, max: 50, step: 0.1 },
  { key: 'power_factor', label: 'Power Factor', unit: '', min: 0.1, max: 1.0, step: 0.01 },
  { key: 'operating_hours', label: 'Operating Hours/Day', unit: 'hrs', min: 1, max: 24, step: 0.5 },
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
      setError(err instanceof Error ? err.message : 'Failed to run diagnosis');
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
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 mb-5 uppercase tracking-wider">
          Motor Parameters
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, unit, min, max, step }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {unit && <span className="text-slate-400">({unit})</span>}
              </label>
              <input
                type="number"
                value={input[key]}
                onChange={e => handleChange(key, e.target.value)}
                min={min}
                max={max}
                step={step}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Diagnosis
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                Diagnosis Result
              </h3>
              <HealthGauge score={result.health_score} category={result.health_category} size={200} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                  <p className="text-xs font-medium opacity-70">Fault Detected</p>
                  <p className="text-sm font-bold">{result.fault_detected}</p>
                </div>
                <div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                  <p className="text-xs font-medium opacity-70">Severity</p>
                  <p className="text-sm font-bold">{result.severity}</p>
                </div>
              </div>

              <a
                href={getReportUrl(result.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </a>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                Maintenance Recommendations
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Ready for Diagnosis</h3>
            <p className="text-sm text-slate-400 mt-2">
              Enter motor operating parameters and click "Run Diagnosis" to get fault analysis results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
