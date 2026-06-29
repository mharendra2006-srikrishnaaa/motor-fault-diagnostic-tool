import { Activity, Gauge, ClipboardList, History, Cpu } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: Gauge },
  { page: 'diagnose', label: 'Diagnose', icon: ClipboardList },
  { page: 'history', label: 'History', icon: History },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 glass-card rounded-none border-r border-t-0 border-b-0 border-l-0 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron text-sm font-bold text-cyan-300 tracking-wider">MOTOR</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">Diagnostic System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
              currentPage === page
                ? 'nav-active text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="tracking-wide">{label}</span>
          </button>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="p-4 border-t border-cyan-500/10">
        <div className="flex items-center gap-2 px-3">
          <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
          <span className="text-xs text-slate-500">System Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 mt-2">
          <Activity className="w-3 h-3 text-cyan-500/50" />
          <span className="text-[10px] text-slate-600 font-orbitron">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
