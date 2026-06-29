import { Zap } from 'lucide-react';
import { Page } from '../types';
import { User } from '../firebase';

interface HeaderProps {
  currentPage: Page;
  user: User;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'CONTROL CENTER', subtitle: 'Real-time motor health monitoring & analytics' },
  diagnose: { title: 'DIAGNOSTIC SCAN', subtitle: 'Enter motor parameters for fault analysis' },
  history: { title: 'ANALYSIS LOG', subtitle: 'Historical diagnostic records & reports' },
};

export default function Header({ currentPage, user }: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];

  return (
    <header className="px-6 py-4 border-b border-cyan-500/10 bg-slate-900/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">{title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 tracking-wide">{subtitle}</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Operator</p>
            <p className="text-xs text-slate-300 font-medium">{user.displayName || 'Engineer'}</p>
          </div>
          <div className="w-px h-8 bg-cyan-500/20" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Status</p>
            <p className="text-xs text-green-400 font-semibold flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
