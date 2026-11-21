import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StoreDetailModal } from './components/StoreDetailModal';
import { BrandDetailModal } from './components/BrandDetailModal';
import { DataMgmtPasswordModal } from './components/DataMgmtPasswordModal';

// Pages
import { DashboardOverview } from './pages/DashboardOverview';
import { BrandPerformance } from './pages/BrandPerformance';
import { StorePerformance } from './pages/StorePerformance';
import { TimeFactorMonitoring } from './pages/TimeFactorMonitoring';
import { ACAMPerformance } from './pages/ACAMPerformance';
import { StockMonitoring } from './pages/StockMonitoring';
import { SalesPerformance } from './pages/SalesPerformance';
import { ProductPerformance } from './pages/ProductPerformance';
import { ActionableInsights } from './pages/ActionableInsights';
import { DataManagement } from './pages/DataManagement';

const DashboardContent: React.FC = () => {
  const { activeTab } = useDashboard();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] sm:p-4 lg:p-7 flex items-center justify-center font-sans antialiased">
      {/* Container */}
      <div className="w-full max-w-[1600px] bg-white rounded-none sm:rounded-[32px] shadow-xl shadow-slate-200/60 border-0 sm:border border-slate-200/70 overflow-hidden flex flex-col md:flex-row min-h-screen sm:min-h-[92vh]">
        {/* Sidebar (Desktop Permanent + Mobile Drawer) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFC] overflow-hidden">
          {/* Top Navbar */}
          <TopNav />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 pb-8 pt-2">
            <div className="mx-auto max-w-7xl">
              {activeTab === 'overview' && <DashboardOverview />}
              {activeTab === 'brand' && <BrandPerformance />}
              {activeTab === 'store' && <StorePerformance />}
              {activeTab === 'timefactor' && <TimeFactorMonitoring />}
              {activeTab === 'acam' && <ACAMPerformance />}
              {activeTab === 'stock' && <StockMonitoring />}
              {activeTab === 'sales' && <SalesPerformance />}
              {activeTab === 'product' && <ProductPerformance />}
              {activeTab === 'insights' && <ActionableInsights />}
              {activeTab === 'datamgmt' && <DataManagement />}
            </div>
          </main>
        </div>
      </div>

      {/* Global Interactive Modals */}
      <StoreDetailModal />
      <BrandDetailModal />
      <DataMgmtPasswordModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
