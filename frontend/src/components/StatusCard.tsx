interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'glow-text', bg: 'from-cyan-500/10' },
  green: { border: 'border-green-500/30', text: 'text-green-400', glow: 'glow-text-green', bg: 'from-green-500/10' },
  amber: { border: 'border-amber-500/30', text: 'text-amber-400', glow: 'glow-text-amber', bg: 'from-amber-500/10' },
  red: { border: 'border-red-500/30', text: 'text-red-400', glow: 'glow-text-red', bg: 'from-red-500/10' },
  purple: { border: 'border-purple-500/30', text: 'text-purple-400', glow: '', bg: 'from-purple-500/10' },
};

export default function StatusCard({ title, value, subtitle, icon, color }: StatusCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`glass-card p-5 ${colors.border} relative overflow-hidden`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} to-transparent opacity-50`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{title}</p>
            <p className={`text-2xl font-bold mt-1 font-orbitron ${colors.text}`}>{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg border ${colors.border} flex items-center justify-center ${colors.text}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
