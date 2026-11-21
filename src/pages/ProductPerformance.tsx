import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { ProductItem } from '../types';
import {
  Boxes,
  TrendingUp,
  Package,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  Percent,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';

export const ProductPerformance: React.FC = () => {
  const { data } = useDashboard();
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TOP_SALES' | 'HIGH_MARGIN' | 'LOW_SALES' | 'ZERO_SALES_WITH_STOCK'>('ALL');

  const products = data.products;

  // Filtered and categorized products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Brand filter
      if (selectedBrand !== 'ALL' && p.program.toUpperCase() !== selectedBrand.toUpperCase()) {
        return false;
      }
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchDescp = p.descp.toLowerCase().includes(q);
        const matchPlu = String(p.plu).includes(q);
        if (!matchDescp && !matchPlu) return false;
      }
      // Category filter
      if (categoryFilter === 'TOP_SALES') {
        return p.net_sales > 10_000_000;
      } else if (categoryFilter === 'HIGH_MARGIN') {
        return p.margin_pct >= 0.20;
      } else if (categoryFilter === 'LOW_SALES') {
        return p.qty_sales > 0 && p.qty_sales < 50;
      } else if (categoryFilter === 'ZERO_SALES_WITH_STOCK') {
        return p.qty_sales === 0 && p.good_stok > 0;
      }

      return true;
    }).sort((a, b) => b.net_sales - a.net_sales);
  }, [products, selectedBrand, searchQuery, categoryFilter]);

  // Top metric highlights
  const topBestseller = useMemo(() => {
    return [...products].sort((a, b) => b.qty_sales - a.qty_sales)[0];
  }, [products]);

  const topRevenue = useMemo(() => {
    return [...products].sort((a, b) => b.net_sales - a.net_sales)[0];
  }, [products]);

  const topMargin = useMemo(() => {
    return [...products].filter((p) => p.net_sales > 1_000_000).sort((a, b) => b.margin_pct - a.margin_pct)[0];
  }, [products]);

  const zeroSalesCount = useMemo(() => {
    return products.filter((p) => p.qty_sales === 0 && p.good_stok > 0).length;
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Product (PLU) Performance & Stock Health
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Analisis granular setiap SKU / PLU program RPM: Penjualan, Margin, Good/Bad Stock, PKM, dan MPKM
        </p>
      </div>

      {/* 4 Feature Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Bestseller */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Volume (Bestseller)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate" title={topBestseller?.descp}>
            {topBestseller?.descp || 'N/A'}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>PLU: {topBestseller?.plu}</span>
            <span className="font-bold text-blue-700">{formatNumber(topBestseller?.qty_sales)} pcs</span>
          </div>
        </div>

        {/* Top Net Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Revenue Product</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-alfamidi-red flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate" title={topRevenue?.descp}>
            {topRevenue?.descp || 'N/A'}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>PLU: {topRevenue?.plu}</span>
            <span className="font-bold text-alfamidi-red">{formatRupiah(topRevenue?.net_sales)}</span>
          </div>
        </div>

        {/* Top Margin Product */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Margin Persen Tertinggi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate" title={topMargin?.descp}>
            {topMargin?.descp || 'N/A'}
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Margin: {topMargin ? (topMargin.margin_pct * 100).toFixed(1) + '%' : 'N/A'}</span>
            <span className="font-bold text-emerald-700">{formatRupiah(topMargin?.margin_rp)}</span>
          </div>
        </div>

        {/* Zero Sales with Stock */}
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stok Tanpa Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-2">
            {zeroSalesCount} <span className="text-sm font-semibold text-amber-700">PLU</span>
          </p>
          <div className="mt-2 text-xs text-amber-800 pt-2 border-t border-amber-200 flex justify-between">
            <span>Potensi Dead Stock</span>
            <span className="font-bold">Perlu Promosi</span>
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-2">
              <Filter className="w-3.5 h-3.5 text-alfamidi-red" />
              <span>Filter Kategori Produk:</span>
            </div>

            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua PLU ({products.length})
            </button>

            <button
              onClick={() => setCategoryFilter('TOP_SALES')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                categoryFilter === 'TOP_SALES'
                  ? 'bg-alfamidi-red text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Top Net Sales (&gt; 10 Juta)
            </button>

            <button
              onClick={() => setCategoryFilter('HIGH_MARGIN')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                categoryFilter === 'HIGH_MARGIN'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Margin Tinggi (&gt;= 20%)
            </button>

            <button
              onClick={() => setCategoryFilter('LOW_SALES')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                categoryFilter === 'LOW_SALES'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Slow Moving (&lt; 50 pcs)
            </button>

            <button
              onClick={() => setCategoryFilter('ZERO_SALES_WITH_STOCK')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                categoryFilter === 'ZERO_SALES_WITH_STOCK'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ada Stok 0 Sales ({zeroSalesCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari PLU / deskripsi produk..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Comprehensive Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Daftar Lengkap Produk RPM ({filteredProducts.length} PLU)
          </h2>
          <span className="text-xs text-slate-500">Diurutkan berdasarkan Net Sales tertinggi</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">PLU</th>
                <th className="py-2.5 px-3 min-w-[200px]">Deskripsi Produk</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3 text-right">Qty Sales</th>
                <th className="py-2.5 px-3 text-right">Net Sales (Rp)</th>
                <th className="py-2.5 px-3 text-right">Margin (Rp)</th>
                <th className="py-2.5 px-3 text-right">Margin (%)</th>
                <th className="py-2.5 px-3 text-right">Good Stok</th>
                <th className="py-2.5 px-3 text-right">PKM</th>
                <th className="py-2.5 px-3 text-right">MPKM</th>
                <th className="py-2.5 px-3 text-center">Status Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isUnderstocked = p.good_stok < p.mpkm_qty;
                const isOverstocked = p.qty_sales > 0 && p.good_stok > p.qty_sales * 10;

                return (
                  <tr key={p.plu} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.plu}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.descp}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{p.program}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatNumber(p.qty_sales)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {formatRupiah(p.net_sales)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                      {formatRupiah(p.margin_rp)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {(p.margin_pct * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatNumber(p.good_stok)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatNumber(p.pkm_qty)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatNumber(p.mpkm_qty)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.qty_sales === 0 && p.good_stok > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          Zero Sales
                        </span>
                      ) : isUnderstocked ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
