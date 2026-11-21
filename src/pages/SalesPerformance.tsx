import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Package,
  Receipt,
  Percent,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
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

export const SalesPerformance: React.FC = () => {
  const { data } = useDashboard();
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const salesSummary = data.sales_summary;

  // Margin percentage overall
  const overallMarginPct = salesSummary.total_net_sales > 0
    ? (salesSummary.total_margin_rp / salesSummary.total_net_sales) * 100
    : 0;

  // Filtered sales rows
  const filteredSales = useMemo(() => {
    return data.sales_rows_sample.filter((s) => {
      if (selectedBrand !== 'ALL' && s.program.toUpperCase() !== selectedBrand.toUpperCase()) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchToko = s.kd_store.toLowerCase().includes(q);
        const matchNama = s.nama_store.toLowerCase().includes(q);
        const matchDescp = s.descp.toLowerCase().includes(q);
        const matchPlu = String(s.plu).includes(q);
        if (!matchToko && !matchNama && !matchDescp && !matchPlu) return false;
      }
      return true;
    });
  }, [data, selectedBrand, searchQuery]);

  // Brand sales chart data
  const brandSalesChart = useMemo(() => {
    return Object.entries(salesSummary.by_brand).map(([bname, s]) => ({
      name: bname,
      netSalesJuta: s.net_sales / 1_000_000,
      qtySales: s.qty_sales,
      marginJuta: s.margin_rp / 1_000_000,
      share: (s.net_sales / salesSummary.total_net_sales) * 100,
    })).sort((a, b) => b.netSalesJuta - a.netSalesJuta);
  }, [salesSummary]);

  // Top 10 Products by Net Sales
  const top10Products = useMemo(() => {
    return [...data.products]
      .sort((a, b) => b.net_sales - a.net_sales)
      .slice(0, 10);
  }, [data]);

  // Bottom 10 Products by Net Sales
  const bottom10Products = useMemo(() => {
    return [...data.products]
      .filter((p) => p.net_sales > 0)
      .sort((a, b) => a.net_sales - b.net_sales)
      .slice(0, 10);
  }, [data]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales Performance Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis pertumbuhan penjualan harian, margin keuntungan, dan kontribusi per brand/toko/PLU
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-alfamidi-red border border-red-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Periode Sales Aktual: {data.meta.sales_period}</span>
          </span>
        </div>
      </div>

      {/* 4 Sales KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Net Sales</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-alfamidi-red flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatRupiah(salesSummary.total_net_sales)}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Data sheet: Sales</span>
            <span className="font-semibold text-slate-700">Alfamidi Branch Medan</span>
          </div>
        </div>

        {/* Total Qty Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kuantitas (Qty)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatNumber(salesSummary.total_qty_sales)} <span className="text-sm font-semibold text-slate-500">pcs</span>
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Unit Terjual</span>
            <span className="font-semibold text-slate-700">{data.meta.total_products} PLU</span>
          </div>
        </div>

        {/* Total Margin Rp */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Margin (Rp)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {formatRupiah(salesSummary.total_margin_rp)}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Margin Persentase:</span>
            <span className="font-bold text-emerald-700">{overallMarginPct.toFixed(2)}%</span>
          </div>
        </div>

        {/* Total Struk Qty */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Struk Qty</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatNumber(salesSummary.total_struk_qty)}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Struk Tercatat</span>
            <span className="font-semibold text-slate-700">7.474 Baris Transaksi</span>
          </div>
        </div>
      </div>

      {/* Sales By Brand Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-1">
          Kontribusi Net Sales &amp; Margin per Brand (Juta Rp)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Visualisasi perbandingan total nilai penjualan bersih dan margin keuntungan masing-masing brand
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brandSalesChart} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `Rp ${val}M`} />
              <Tooltip
                formatter={(val: number, name: string) => [
                  `Rp ${val.toFixed(2)} Juta`,
                  name === 'netSalesJuta' ? 'Net Sales' : 'Margin',
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
              <Bar dataKey="netSalesJuta" name="Net Sales (Juta Rp)" fill="#D71920" radius={[4, 4, 0, 0]} />
              <Bar dataKey="marginJuta" name="Margin (Juta Rp)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 & Bottom 10 Sales Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Top 10 Produk Penjualan Tertinggi</h2>
              <p className="text-[11px] text-slate-500">Berdasarkan total Net Sales aktual</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2.5">PLU</th>
                  <th className="py-2 px-2.5">Deskripsi Produk</th>
                  <th className="py-2 px-2.5">Brand</th>
                  <th className="py-2 px-2.5 text-right">Qty</th>
                  <th className="py-2 px-2.5 text-right">Net Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10Products.map((p, idx) => (
                  <tr key={p.plu} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 font-mono text-slate-600">{p.plu}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 truncate max-w-[160px]">
                      {p.descp}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">{p.program}</td>
                    <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                      {formatNumber(p.qty_sales)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-black text-slate-900">
                      {formatRupiah(p.net_sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Bottom 10 Produk Penjualan Terendah</h2>
              <p className="text-[11px] text-slate-500">Produk aktif dengan omset penjualan paling minim</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2.5">PLU</th>
                  <th className="py-2 px-2.5">Deskripsi Produk</th>
                  <th className="py-2 px-2.5">Brand</th>
                  <th className="py-2 px-2.5 text-right">Qty</th>
                  <th className="py-2 px-2.5 text-right">Net Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bottom10Products.map((p) => (
                  <tr key={p.plu} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 font-mono text-slate-600">{p.plu}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 truncate max-w-[160px]">
                      {p.descp}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">{p.program}</td>
                    <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                      {formatNumber(p.qty_sales)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-black text-rose-700">
                      {formatRupiah(p.net_sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Transactions Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Tabel Transaksi Sales per Toko &amp; PLU</h2>
            <p className="text-xs text-slate-500">
              Menampilkan data aktual penjualan harian produk RPM
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="ALL">Semua Brand</option>
              {Object.keys(salesSummary.by_brand).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
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

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Nama Toko</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">PLU</th>
                <th className="py-2.5 px-3 min-w-[180px]">Deskripsi</th>
                <th className="py-2.5 px-3 text-right">Qty Sales</th>
                <th className="py-2.5 px-3 text-right">Net Sales (Rp)</th>
                <th className="py-2.5 px-3 text-right">Margin (Rp)</th>
                <th className="py-2.5 px-3 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.kd_store}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[150px]">
                    {s.nama_store}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{s.program}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{s.plu}</td>
                  <td className="py-2.5 px-3 text-slate-900 truncate max-w-[180px]">{s.descp}</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    {formatNumber(s.qty_sales)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    {formatRupiah(s.net_sales)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">
                    {formatRupiah(s.margin_rp)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatNumber(s.struk_qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredSales.length)} dari {filteredSales.length} baris sales
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
