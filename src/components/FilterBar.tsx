import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Filter, RotateCcw, Search } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    amOptions,
    acOptions,
    brandOptions,
    filteredStores,
    data,
  } = useDashboard();

  const isFiltered =
    filters.brand !== 'ALL' ||
    filters.am !== 'ALL' ||
    filters.ac !== 'ALL' ||
    filters.storeQuery !== '' ||
    filters.performanceTier !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs mb-5">
      <div className="flex flex-col gap-3">
        {/* Header row: Label + Stats + Reset */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-alfamidi-red" />
            <span>Filter &amp; Pencarian:</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Tampil <span className="font-bold text-slate-900">{filteredStores.length}</span> dari{' '}
              <span className="font-semibold text-slate-700">{data.meta.total_stores}</span> toko
            </div>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-alfamidi-red hover:text-red-700 font-bold px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Selects & Search Input: Responsive Grid on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <select
            value={filters.brand}
            onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
            className="w-full lg:w-auto text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-alfamidi-red font-medium text-slate-700"
          >
            <option value="ALL">Semua Brand ({brandOptions.length} Brand)</option>
            {brandOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* AM Filter */}
          <select
            value={filters.am}
            onChange={(e) => setFilters((prev) => ({ ...prev, am: e.target.value }))}
            className="w-full lg:w-auto text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-alfamidi-red font-medium text-slate-700"
          >
            <option value="ALL">Semua AM ({amOptions.length} AM)</option>
            {amOptions.map((am) => (
              <option key={am} value={am}>
                AM {am}
              </option>
            ))}
          </select>

          {/* AC Filter */}
          <select
            value={filters.ac}
            onChange={(e) => setFilters((prev) => ({ ...prev, ac: e.target.value }))}
            className="w-full lg:w-auto text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-alfamidi-red font-medium text-slate-700"
          >
            <option value="ALL">Semua AC ({acOptions.length} AC)</option>
            {acOptions.map((ac) => (
              <option key={ac} value={ac}>
                AC {ac}
              </option>
            ))}
          </select>

          {/* Performance Tier */}
          <select
            value={filters.performanceTier}
            onChange={(e) => setFilters((prev) => ({ ...prev, performanceTier: e.target.value }))}
            className="w-full lg:w-auto text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-alfamidi-red font-medium text-slate-700"
          >
            <option value="ALL">Semua Status Performa</option>
            <option value="ABOVE_TF">Di Atas Time Factor (&gt;= {(data.meta.time_factor * 100).toFixed(1)}%)</option>
            <option value="BELOW_TF">Di Bawah Time Factor (&lt; {(data.meta.time_factor * 100).toFixed(1)}%)</option>
            <option value="HIGH">Kinerja Unggul (&gt;= 100%)</option>
            <option value="MED">Kinerja Cukup (80% - 99%)</option>
            <option value="LOW">Kinerja Kritis (&lt; 80%)</option>
          </select>

          {/* Store Search */}
          <div className="relative w-full sm:col-span-2 lg:col-span-1 lg:w-48 xl:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.storeQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, storeQuery: e.target.value }))}
              placeholder="Cari kode/nama toko..."
              className="w-full pl-8 pr-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-alfamidi-red font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
