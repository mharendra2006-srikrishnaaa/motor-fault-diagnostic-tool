import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Motor health overview and analytics' },
  diagnose: { title: 'Run Diagnosis', subtitle: 'Enter motor parameters for fault analysis' },
  history: { title: 'Diagnostic History', subtitle: 'Previous analysis records and reports' },
};

export default function Header({ currentPage }: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}
