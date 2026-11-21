import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { exportDashboardPDF, exportCleanedExcel } from '../utils/exportUtils';
import {
  Menu,
  Search,
  Bell,
  FileSpreadsheet,
  FileText,
  LogOut,
  Calendar,
  Store,
  Clock,
  ChevronDown
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { data, filters, setFilters, setIsMobileMenuOpen } = useDashboard();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cleanPeriod = data.meta.period.replace('MONITORING RPM PERIODE ', '').trim();
  const displayName = user?.name ? user.name.trim() : '';

  return (
    <header className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 select-none relative border-b border-slate-100/80 bg-white/70 backdrop-blur-xs">
      {/* Top Main Row: Mobile Hamburger + Greeting + Search & User Profile */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button + Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs shrink-0 cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tight truncate">
              Selamat Datang{displayName ? `, ${displayName}` : ''}! <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h1>
          </div>
        </div>

        {/* Right Side: Search, Export Buttons, Bell, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Pill - Hidden on very small screens, displayed on sm+ or toggled */}
          <div className="relative hidden sm:block w-44 lg:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.storeQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, storeQuery: e.target.value }))}
              placeholder="Cari toko, PLU..."
              className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 text-xs rounded-full border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D71920]/20 focus:border-[#D71920] transition-all text-slate-700"
            />
          </div>

          {/* Export PDF Button (hidden on mobile, visible on sm+) */}
          <button
            onClick={() => exportDashboardPDF(data)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden lg:inline">PDF</span>
          </button>

          {/* Export Excel Button (hidden on mobile, visible on sm+) */}
          <button
            onClick={() => exportCleanedExcel(data)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">XLSX</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="w-2 h-2 rounded-full bg-[#D71920] absolute top-0.5 right-0.5 ring-2 ring-white" />
          </div>

          {/* User Profile Avatar Pill with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-0.5 sm:p-1 sm:pr-2.5 rounded-full hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#005BAA] to-[#D71920] p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-slate-800">
                    {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'U')}
                  </div>
                </div>
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
              </div>

              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 sm:top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-full">
                    Alfamidi Branch Medan
                  </span>
                </div>

                <div className="py-1">
                  {/* Export buttons on mobile dropdown */}
                  <div className="sm:hidden border-b border-slate-100 pb-1 mb-1 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        exportDashboardPDF(data);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        exportCleanedExcel(data);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Download Excel</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input (visible on small mobile screens < sm) */}
      <div className="relative sm:hidden w-full">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.storeQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, storeQuery: e.target.value }))}
          placeholder="Cari toko, PLU..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]/20 focus:border-[#D71920] transition-all text-slate-700"
        />
      </div>

      {/* Bottom Subrow: Polished, Modern Meta Badges (Scrollable on small mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-[10px] sm:text-[11px] scrollbar-none">
        {/* Badge 1: Periode */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-600 font-semibold shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#005BAA]" />
          <span>Periode {cleanPeriod}</span>
        </div>

        {/* Badge 2: Branch & Toko */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-[#005BAA] font-semibold shrink-0">
          <Store className="w-3.5 h-3.5 text-[#005BAA]" />
          <span>Alfamidi Branch Medan</span>
          <span className="text-blue-300">•</span>
          <span className="font-bold text-slate-700">{data.meta.total_stores} Toko</span>
        </div>

        {/* Badge 3: Time Factor */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50/70 border border-red-100 text-[#D71920] font-bold shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#D71920]" />
          <span>Hari ke-{data.meta.hari_ke}</span>
          <span className="text-red-200">•</span>
          <span>TF: {(data.meta.time_factor * 100).toFixed(2)}%</span>
        </div>
      </div>
    </header>
  );
};
