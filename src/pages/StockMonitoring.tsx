import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber } from '../utils/formatters';
import {
  Package,
  AlertTriangle,
  Boxes,
  ShieldCheck,
  Building,
  Store,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const StockMonitoring: React.FC = () => {
  const { data } = useDashboard();
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const stockSummary = data.stock_summary;

  // Filtered stock rows
  const filteredStock = useMemo(() => {
    return data.stock_rows_sample.filter((s) => {
      if (selectedBrand !== 'ALL' && s.program.toUpperCase() !== selectedBrand.toUpperCase()) {
        return false;
      }
      if (selectedLocation !== 'ALL' && s.lokasi !== selectedLocation) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchToko = s.toko.toLowerCase().includes(q);
        const matchNama = s.nama_toko.toLowerCase().includes(q);
        const matchDescp = s.descp.toLowerCase().includes(q);
        const matchPlu = String(s.plu).includes(q);
        if (!matchToko && !matchNama && !matchDescp && !matchPlu) return false;
      }
      return true;
    });
  }, [data, selectedBrand, selectedLocation, searchQuery]);

  // Low stock items (Good Stock < MPKM)
  const lowStockItems = useMemo(() => {
    return filteredStock.filter((s) => s.good_stok < s.mpkm_qty);
  }, [filteredStock]);

  // Brand chart data
  const brandChartData = useMemo(() => {
    return Object.entries(stockSummary.by_brand).map(([bname, stats]) => ({
      name: bname,
      goodStock: stats.good_stock,
      badStock: stats.bad_stock,
      valueJuta: stats.good_stock_rp / 1_000_000,
    })).sort((a, b) => b.goodStock - a.goodStock);
  }, [stockSummary]);

  // Location Pie
  const locationPie = [
    { name: 'Stok Toko', value: stockSummary.by_location.Toko, color: '#D71920' },
    { name: 'Stok Branch Medan', value: stockSummary.by_location.DC, color: '#005BAA' },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredStock.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStock.slice(start, start + pageSize);
  }, [filteredStock, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Stock Monitoring & Inventory Health
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring posisi Good Stock, Bad Stock, Nilai Persediaan, PKM, MPKM, Minor, dan Mindis di Toko &amp; DC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Stok Aktual: {data.meta.stock_date}</span>
          </span>
        </div>
      </div>

      {/* KPI 8 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Good Stock Qty */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Good Stock</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatNumber(stockSummary.total_good_stock)} <span className="text-sm font-semibold text-slate-500">pcs</span>
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Stok Siap Jual</span>
            <span className="font-semibold text-emerald-700">Layak Jual</span>
          </div>
        </div>

        {/* Good Stock Value (Rp) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Good Stock Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatRupiah(stockSummary.total_good_stock_rp)}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Nilai Inventory</span>
            <span className="font-semibold text-slate-700">Toko + DC</span>
          </div>
        </div>

        {/* Bad Stock Qty & Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bad Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {formatNumber(stockSummary.total_bad_stock)} <span className="text-sm font-semibold text-slate-500">pcs</span>
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Nilai Bad Stock:</span>
            <span className="font-bold text-rose-700">{formatRupiah(stockSummary.total_bad_stock_rp)}</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-2">
            {lowStockItems.length} <span className="text-sm font-semibold text-amber-700">Item</span>
          </p>
          <div className="mt-2 text-xs text-amber-800 pt-2 border-t border-amber-200 flex justify-between">
            <span>Stok &lt; MPKM Qty</span>
            <span className="font-bold">Perlu Reorder</span>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Good Stock by Brand */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-1">
            Distribusi Good Stock berdasarkan Brand (pcs)
          </h2>
          <p className="text-xs text-slate-500 mb-4">Total unit persediaan barang siap jual per brand</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${formatNumber(val)} pcs`, 'Good Stock']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
                <Bar dataKey="goodStock" name="Good Stock (pcs)" fill="#005BAA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DC vs Toko Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Lokasi Persediaan</h2>
            <p className="text-xs text-slate-500 mb-4">Perbandingan persediaan di Toko vs Alfamidi Branch Medan</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {locationPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${formatNumber(val)} pcs`, 'Jumlah']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Stok Toko: <strong>{formatNumber(stockSummary.by_location.Toko)}</strong></span>
            <span>Stok DC: <strong>{formatNumber(stockSummary.by_location.DC)}</strong></span>
          </div>
        </div>
      </div>

      {/* Stock Detail Table with Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Tabel Detail Stok Produk</h2>
            <p className="text-xs text-slate-500">
              Filter berdasarkan brand, lokasi (DC/Toko), atau pencarian kode/nama toko/PLU
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="ALL">Semua Brand</option>
              {Object.keys(stockSummary.by_brand).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="ALL">Semua Lokasi</option>
              <option value="Toko">Toko</option>
              <option value="DC">DC</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari toko / PLU..."
                className="pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Toko</th>
                <th className="py-2.5 px-3">Nama Toko</th>
                <th className="py-2.5 px-3">Lokasi</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">PLU</th>
                <th className="py-2.5 px-3 min-w-[180px]">Deskripsi</th>
                <th className="py-2.5 px-3 text-right">Good Stok</th>
                <th className="py-2.5 px-3 text-right">Bad Stok</th>
                <th className="py-2.5 px-3 text-right">Nilai Good (Rp)</th>
                <th className="py-2.5 px-3 text-right">PKM</th>
                <th className="py-2.5 px-3 text-right">MPKM</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((s, idx) => {
                const isLow = s.good_stok < s.mpkm_qty;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.toko}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[150px]">
                      {s.nama_toko}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{s.lokasi}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{s.program}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{s.plu}</td>
                    <td className="py-2.5 px-3 text-slate-900 truncate max-w-[180px]">{s.descp}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatNumber(s.good_stok)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                      {formatNumber(s.bad_stok)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {formatRupiah(s.good_stok_rp)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatNumber(s.pkm_qty)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatNumber(s.mpkm_qty)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Aman
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredStock.length)} dari {filteredStock.length} data stok
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2 text-slate-700">
              Hal {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
