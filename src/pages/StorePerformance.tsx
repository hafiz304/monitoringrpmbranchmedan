import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FilterBar } from '../components/FilterBar';
import { formatPercent, getMatrixHeatmapColor } from '../utils/formatters';
import { StoreItem } from '../types';
import {
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  Flame,
  HelpCircle
} from 'lucide-react';

export const StorePerformance: React.FC = () => {
  const { filteredStores, setSelectedStore, data } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const brands = useMemo(() => {
    return (data.meta.brands && data.meta.brands.length > 0)
      ? data.meta.brands
      : Object.keys(data.resume_brands);
  }, [data]);

  // Top 10 and Bottom 10 from filtered list
  const sortedByAvg = useMemo(() => {
    return [...filteredStores].sort((a, b) => (b.avg || 0) - (a.avg || 0));
  }, [filteredStores]);

  const top10 = useMemo(() => sortedByAvg.slice(0, 10), [sortedByAvg]);
  const bottom10 = useMemo(() => [...sortedByAvg].reverse().slice(0, 10), [sortedByAvg]);

  // Pagination for main table
  const totalPages = Math.ceil(filteredStores.length / pageSize) || 1;
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Store Performance Monitoring
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring komprehensif performa {data.meta.total_stores} toko Alfamidi terhadap {brands.length} brand program Rekomendasi Produk Mingguan (RPM)
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Top 10 & Bottom 10 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Top 10 Store Performance</h2>
                <p className="text-[11px] text-slate-500">10 Toko dengan rata-rata pencapaian tertinggi</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Performa Unggul
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2.5">Rank</th>
                  <th className="py-2 px-2.5">Kode</th>
                  <th className="py-2 px-2.5">Nama Toko</th>
                  <th className="py-2 px-2.5">AM</th>
                  <th className="py-2 px-2.5 text-right">Avg Achv</th>
                  <th className="py-2 px-2.5 text-center">&gt;= TF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10.map((s, idx) => (
                  <tr
                    key={s.kode}
                    onClick={() => setSelectedStore(s)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2.5 font-black text-emerald-600">#{idx + 1}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-700">{s.kode}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 truncate max-w-[150px]">
                      {s.nama}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">{s.am}</td>
                    <td className="py-2 px-2.5 text-right font-black text-emerald-700">
                      {formatPercent(s.avg)}
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold text-slate-700">
                      {s.above_tf_count} / {brands.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Bottom 10 Store Performance</h2>
                <p className="text-[11px] text-slate-500">10 Toko dengan performa paling membutuhkan evaluasi</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Evaluasi Segera
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2.5">Rank</th>
                  <th className="py-2 px-2.5">Kode</th>
                  <th className="py-2 px-2.5">Nama Toko</th>
                  <th className="py-2 px-2.5">AM</th>
                  <th className="py-2 px-2.5 text-right">Avg Achv</th>
                  <th className="py-2 px-2.5 text-center">&gt;= TF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bottom10.map((s, idx) => (
                  <tr
                    key={s.kode}
                    onClick={() => setSelectedStore(s)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2.5 font-black text-rose-600">#{idx + 1}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-700">{s.kode}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 truncate max-w-[150px]">
                      {s.nama}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">{s.am}</td>
                    <td className="py-2 px-2.5 text-right font-black text-rose-700">
                      {formatPercent(s.avg)}
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold text-slate-700">
                      {s.above_tf_count} / {brands.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix & Store Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-alfamidi-red" />
              Store Performance Matrix & Heatmap
            </h2>
            <p className="text-xs text-slate-500">
              Klik baris toko manapun untuk membuka detail pencapaian produk, penjualan, dan stok toko tersebut.
            </p>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Legenda Heatmap:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
              &gt;= 1.0 (Hijau)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
              0.80 – 0.99 (Kuning)
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold border border-rose-200">
              &lt; 0.80 (Merah)
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3 min-w-[170px]">Nama Toko</th>
                <th className="py-3 px-2 text-center">AM</th>
                <th className="py-3 px-2 text-center">AC</th>
                {brands.map((b) => (
                  <th key={b} className="py-3 px-2 text-center whitespace-nowrap">
                    {b}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">Average</th>
                <th className="py-3 px-2 text-center">&gt;= TF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStores.map((s) => {
                return (
                  <tr
                    key={s.kode}
                    onClick={() => setSelectedStore(s)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.kode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[200px]">
                      {s.nama}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-600">{s.am}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500">{s.ac}</td>

                    {/* Dynamic Brand Heatmap Cells */}
                    {brands.map((b) => {
                      const val = s.brand_values?.[b] !== undefined ? s.brand_values[b] : (s as any)[b.toLowerCase().replace(/[^a-z0-9]/g, '')];
                      const color = getMatrixHeatmapColor(val);
                      return (
                        <td key={b} className={`py-2.5 px-2 text-center rounded-sm ${color.bg}`}>
                          {formatPercent(val, 1)}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatPercent(s.avg)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.above_tf_count >= Math.ceil(brands.length / 2)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.above_tf_count} / {brands.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredStores.length)} dari {filteredStores.length} toko
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2 text-slate-700">
              Hal {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
