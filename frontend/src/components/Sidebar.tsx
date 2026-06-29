import { Activity, Gauge, ClipboardList, History, Cpu, LogOut } from 'lucide-react';
import { Page } from '../types';
import { logOut, User } from '../firebase';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User;
}

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: Gauge },
  { page: 'diagnose', label: 'Diagnose', icon: ClipboardList },
  { page: 'history', label: 'History', icon: History },
];

export default function Sidebar({ currentPage, onNavigate, user }: SidebarProps) {
  const handleLogout = async () => {
    await logOut();
  };

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

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-cyan-500/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-cyan-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <span className="text-xs text-cyan-400 font-bold">
                {user.displayName?.[0] || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate">{user.displayName || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="flex items-center gap-2 px-3 mt-3">
          <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
          <span className="text-[10px] text-slate-600">System Online</span>
          <Activity className="w-3 h-3 text-cyan-500/30 ml-auto" />
        </div>
      </div>
    </aside>
  );
}
