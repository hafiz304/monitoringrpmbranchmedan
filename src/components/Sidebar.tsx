import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Award,
  Store,
  Clock,
  Users,
  Package,
  TrendingUp,
  Boxes,
  Lightbulb,
  Database,
  LogOut,
  X,
  Lock,
  Unlock
} from 'lucide-react';

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    data,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDataMgmtUnlocked,
    setIsDataMgmtModalOpen
  } = useDashboard();
  const { user, logout } = useAuth();

  const brandCount = (data.meta.brands && data.meta.brands.length > 0)
    ? data.meta.brands.length
    : Object.keys(data.resume_brands).length;

  const aboveTfCount = Object.values(data.resume_brands).filter(
    (b) => (b.point || 0) >= data.meta.time_factor
  ).length;

  const mainMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'brand', label: 'Brand Performance', icon: Award, badge: `${brandCount} Brand` },
    { id: 'store', label: 'Store Performance', icon: Store, badge: `${data.meta.total_stores}` },
    {
      id: 'timefactor',
      label: 'Time Factor',
      icon: Clock,
      badge: `${aboveTfCount}/${brandCount}`,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    { id: 'acam', label: 'AC-AM Matrix', icon: Users, badge: `${data.resume_am_ranking.length} AM` },
    { id: 'stock', label: 'Stock Health', icon: Package },
    { id: 'sales', label: 'Sales Growth', icon: TrendingUp },
    { id: 'product', label: 'Products (PLU)', icon: Boxes },
    { id: 'insights', label: 'Actionable Insights', icon: Lightbulb, badge: '8', badgeColor: 'bg-rose-100 text-rose-700' },
    {
      id: 'datamgmt',
      label: 'Data Management',
      icon: Database,
      badge: isDataMgmtUnlocked ? 'Terbuka' : 'Terkunci',
      badgeColor: isDataMgmtUnlocked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'datamgmt' && !isDataMgmtUnlocked) {
      setIsDataMgmtModalOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderNavContent = (isMobile: boolean) => (
    <>
      {/* Brand Logo Header */}
      <div className="px-3 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D71920] to-[#005BAA] flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
            M
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              alfa<span className="text-[#D71920]">midi</span>
            </span>
            <span className="text-[10px] block font-bold text-[#005BAA] -mt-1 tracking-wider uppercase">
              RPM BI Dashboard
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative">
              {isActive && (
                <div className="absolute -left-4 top-2 bottom-2 w-1.5 bg-[#D71920] rounded-r-full shadow-sm" />
              )}
              <button
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#D71920] bg-red-50/70 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#D71920]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 ${
                      item.badgeColor || (isActive ? 'bg-red-100 text-[#D71920]' : 'bg-slate-100 text-slate-500')
                    }`}
                  >
                    {item.id === 'datamgmt' && (
                      isDataMgmtUnlocked ? <Unlock className="w-2.5 h-2.5 text-emerald-600" /> : <Lock className="w-2.5 h-2.5 text-amber-600" />
                    )}
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* User Status Bar & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
            <span className="text-[10px] text-slate-500 block truncate">Alfamidi Branch Medan</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-60 bg-white flex-col h-full border-r border-slate-100 select-none py-6 px-4 shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white flex flex-col h-full z-50 shadow-2xl py-6 px-4 select-none transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </aside>
    </>
  );
};
