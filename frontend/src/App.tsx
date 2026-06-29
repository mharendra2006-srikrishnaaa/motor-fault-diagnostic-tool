import { useState, useEffect } from 'react';
import { Page, DiagnosticResult } from './types';
import { onAuthChange, User } from './firebase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnimatedBackground from './components/AnimatedBackground';
import LoginPage from './components/LoginPage';
import Dashboard from './pages/Dashboard';
import DiagnoseForm from './pages/DiagnoseForm';
import History from './pages/History';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDiagnosisComplete = (result: DiagnosticResult) => {
    setLastResult(result);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-cyan-400/60 font-orbitron tracking-widest">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  // Logged in — show app
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard lastResult={lastResult} />;
      case 'diagnose':
        return <DiagnoseForm onDiagnosisComplete={handleDiagnosisComplete} />;
      case 'history':
        return <History />;
      default:
        return <Dashboard lastResult={lastResult} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatedBackground />
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
