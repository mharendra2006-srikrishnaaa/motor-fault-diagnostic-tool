import { useState } from 'react';
import { Page, DiagnosticResult } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnimatedBackground from './components/AnimatedBackground';
import Dashboard from './pages/Dashboard';
import DiagnoseForm from './pages/DiagnoseForm';
import History from './pages/History';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(null);

  const handleDiagnosisComplete = (result: DiagnosticResult) => {
    setLastResult(result);
  };

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
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
