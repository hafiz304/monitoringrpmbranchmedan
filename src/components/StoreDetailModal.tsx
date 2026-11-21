import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent, getAchievementColor } from '../utils/formatters';
import { X, Store, Award, Package, ShoppingCart, MapPin, UserCheck, AlertTriangle } from 'lucide-react';

export const StoreDetailModal: React.FC = () => {
  const { selectedStore, setSelectedStore, data } = useDashboard();

  const brands = useMemo(() => {
    return (data.meta.brands && data.meta.brands.length > 0)
      ? data.meta.brands
      : Object.keys(data.resume_brands);
  }, [data]);

  const brandStoreDetails = useMemo(() => {
    if (!selectedStore) return [];
    return brands.map((bname) => {
      const list = data.brand_store_data[bname] || [];
      const storeItem = list.find((s) => s.kode === selectedStore.kode);
      return {
        brand: bname,
        data: storeItem || null,
      };
    });
  }, [selectedStore, data, brands]);

  // Stock items for this store
  const storeStocks = useMemo(() => {
    if (!selectedStore) return [];
    return data.stock_rows_sample.filter((s) => s.toko === selectedStore.kode);
  }, [selectedStore, data]);

  // Sales items for this store
  const storeSales = useMemo(() => {
    if (!selectedStore) return [];
    return data.sales_rows_sample.filter((s) => s.kd_store === selectedStore.kode);
  }, [selectedStore, data]);

  if (!selectedStore) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-start justify-between">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
                  {selectedStore.kode}
                </span>
                <span className="text-[10px] sm:text-xs bg-white/15 px-2 py-0.5 rounded text-white/90">
                  AM: {selectedStore.am} | AC: {selectedStore.ac}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold mt-1 text-white truncate">{selectedStore.nama}</h2>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 truncate">
                Rata-rata: {formatPercent(selectedStore.avg)} • {selectedStore.above_tf_count} dari {brands.length} Brand &gt;= TF
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {/* Brand Breakdown Matrix for this Store */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-alfamidi-red" />
                Pencapaian {brands.length} Brand RPM di Toko Ini
              </h3>
              <span className="text-xs text-slate-500">Benchmark Time Factor: {(data.meta.time_factor * 100).toFixed(2)}%</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Brand</th>
                    <th className="py-2.5 px-3">Actual Sales</th>
                    <th className="py-2.5 px-3">Target Sales</th>
                    <th className="py-2.5 px-3">Achv Sales</th>
                    <th className="py-2.5 px-3">Actual Qty</th>
                    <th className="py-2.5 px-3">Target Qty</th>
                    <th className="py-2.5 px-3">Point Score</th>
                    <th className="py-2.5 px-3">Stock (pcs)</th>
                    <th className="py-2.5 px-3">DSI (hari)</th>
                    <th className="py-2.5 px-3 text-center">Status TF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brandStoreDetails.map(({ brand, data: bData }) => {
                    const isAbove = (bData?.point || 0) >= data.meta.time_factor;
                    return (
                      <tr key={brand} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{brand}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{formatRupiah(bData?.actual_net_sales)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatRupiah(bData?.target_net_sales)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(bData?.acv_net_sales)}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{formatNumber(bData?.actual_qty)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatNumber(bData?.target_qty)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {bData?.point ? (bData.point * 100).toFixed(2) + ' pts' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(bData?.stock_pcs)}</td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(bData?.dsi, 1)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAbove ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isAbove ? 'DIATAS TF' : 'DIBAWAH TF'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Breakdown */}
          {storeSales.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Catatan Penjualan Produk di Toko Ini ({storeSales.length} Transaksi Item)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-48">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">PLU</th>
                      <th className="py-2 px-3">Deskripsi Produk</th>
                      <th className="py-2 px-3">Brand</th>
                      <th className="py-2 px-3 text-right">Qty Sales</th>
                      <th className="py-2 px-3 text-right">Net Sales</th>
                      <th className="py-2 px-3 text-right">Margin Rp</th>
                      <th className="py-2 px-3 text-right">Struk Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeSales.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-600">{s.plu}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{s.descp}</td>
                        <td className="py-2 px-3 text-slate-600">{s.program}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-800">{formatNumber(s.qty_sales)}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-800">{formatRupiah(s.net_sales)}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-medium">{formatRupiah(s.margin_rp)}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{formatNumber(s.struk_qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stock Availability Breakdown */}
          {storeStocks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-blue-600" />
                Status Ketersediaan Stok Toko ({storeStocks.length} PLU)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-48">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">PLU</th>
                      <th className="py-2 px-3">Deskripsi Produk</th>
                      <th className="py-2 px-3">Brand</th>
                      <th className="py-2 px-3 text-right">Good Stok</th>
                      <th className="py-2 px-3 text-right">Bad Stok</th>
                      <th className="py-2 px-3 text-right">PKM</th>
                      <th className="py-2 px-3 text-right">MPKM</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeStocks.map((st, idx) => {
                      const isLow = st.good_stok < st.mpkm_qty;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-600">{st.plu}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{st.descp}</td>
                          <td className="py-2 px-3 text-slate-600">{st.program}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">{formatNumber(st.good_stok)}</td>
                          <td className="py-2 px-3 text-right text-rose-600 font-medium">{formatNumber(st.bad_stok)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatNumber(st.pkm_qty)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatNumber(st.mpkm_qty)}</td>
                          <td className="py-2 px-3 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Normal
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
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Data Toko {selectedStore.kode} • Alfamidi Branch Medan</span>
          <button
            onClick={() => setSelectedStore(null)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
