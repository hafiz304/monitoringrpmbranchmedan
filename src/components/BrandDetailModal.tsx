import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { X, Award, Users, UserCheck, Store, Package, TrendingUp } from 'lucide-react';

export const BrandDetailModal: React.FC = () => {
  const { selectedBrand, setSelectedBrand, data } = useDashboard();
  const [roleTab, setRoleTab] = useState<'AM' | 'AC'>('AM');

  const brandResume = useMemo(() => {
    if (!selectedBrand) return null;
    return data.resume_brands[selectedBrand] || null;
  }, [selectedBrand, data]);

  const amList = useMemo(() => {
    if (!selectedBrand) return [];
    return data.acam_data[selectedBrand] || [];
  }, [selectedBrand, data]);

  const acList = useMemo(() => {
    if (!selectedBrand) return [];
    return data.ac_brand_data?.[selectedBrand] || [];
  }, [selectedBrand, data]);

  const storeList = useMemo(() => {
    if (!selectedBrand) return [];
    const list = data.brand_store_data[selectedBrand] || [];
    return [...list].sort((a, b) => (b.point || 0) - (a.point || 0));
  }, [selectedBrand, data]);

  const brandProducts = useMemo(() => {
    if (!selectedBrand) return [];
    return data.products.filter(
      (p) => p.program.toUpperCase() === selectedBrand.toUpperCase()
    );
  }, [selectedBrand, data]);

  const formatAmName = (name: string | undefined | null, index?: number) => {
    if (!name) return 'AM';
    let str = String(name).trim();
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const uniqueAms = Array.from(new Set(data.stores.map((s) => s.am).filter((s) => s && !/^\d+$/.test(s))));
      if (uniqueAms[idx]) str = uniqueAms[idx];
      else if (index !== undefined && uniqueAms[index]) str = uniqueAms[index];
    }
    str = str.replace(/^AM\s*[-.:]?\s*/i, '').trim();
    return `AM ${str}`;
  };

  const formatAcName = (name: string | undefined | null, index?: number) => {
    if (!name) return 'AC';
    let str = String(name).trim();
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const uniqueAcs = Array.from(new Set(data.stores.map((s) => s.ac).filter((s) => s && !/^\d+$/.test(s))));
      if (uniqueAcs[idx]) str = uniqueAcs[idx];
      else if (index !== undefined && uniqueAcs[index]) str = uniqueAcs[index];
    }
    str = str.replace(/^AC\s*[-.:]?\s*/i, '').trim();
    return `AC ${str}`;
  };

  if (!selectedBrand || !brandResume) return null;

  const isAboveTf = (brandResume.point || 0) >= data.meta.time_factor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-start justify-between">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
                  BRAND PROFILE
                </span>
                <span
                  className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold ${
                    isAboveTf ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isAboveTf ? 'DIATAS TIME FACTOR' : 'DIBAWAH TIME FACTOR'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white truncate">{selectedBrand}</h2>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 truncate">
                Point Performance: {brandResume.point ? (brandResume.point * 100).toFixed(2) + ' pts' : 'N/A'} • Time Factor: {(data.meta.time_factor * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBrand(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3.5">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Net Sales (Act/Tgt)</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{formatRupiah(brandResume.actual_net_sales)}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-slate-500">
                <span className="truncate">Tgt: {formatRupiah(brandResume.target_net_sales)}</span>
                <span className="font-semibold text-slate-800 shrink-0 ml-1">{formatPercent(brandResume.acv_net_sales)}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3.5">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Qty Sales (Act/Tgt)</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{formatNumber(brandResume.actual_qty)} pcs</p>
              <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-slate-500">
                <span className="truncate">Tgt: {formatNumber(brandResume.target_qty)}</span>
                <span className="font-semibold text-slate-800 shrink-0 ml-1">{formatPercent(brandResume.acv_qty)}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3.5">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Struk (Act/Tgt)</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{formatNumber(brandResume.actual_struk)}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-slate-500">
                <span className="truncate">Tgt: {formatNumber(brandResume.target_struk)}</span>
                <span className="font-semibold text-slate-800 shrink-0 ml-1">{formatPercent(brandResume.acv_struk)}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3.5">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Inventory & DSI</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{formatNumber(brandResume.dsi, 1)} Hari</p>
              <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-slate-500">
                <span>Toko: {formatNumber(brandResume.stock_toko)}</span>
                <span>DC: {formatNumber(brandResume.stock_dc)}</span>
              </div>
            </div>
          </div>

          {/* AM & AC Performance Section with Clean Tab Switcher */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {roleTab === 'AM' ? (
                  <Users className="w-4 h-4 text-alfamidi-red" />
                ) : (
                  <UserCheck className="w-4 h-4 text-[#005BAA]" />
                )}
                <h3 className="text-sm font-bold text-slate-800">
                  {roleTab === 'AM'
                    ? `Performa Area Manager (AM) pada Brand ${selectedBrand} (${amList.length} AM)`
                    : `Performa Area Coordinator (AC) pada Brand ${selectedBrand} (${acList.length} AC)`}
                </h3>
              </div>

              {/* Tab Selector: AM vs AC */}
              <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs">
                <button
                  onClick={() => setRoleTab('AM')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    roleTab === 'AM'
                      ? 'bg-white text-alfamidi-red shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Area Manager ({amList.length})</span>
                </button>
                <button
                  onClick={() => setRoleTab('AC')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    roleTab === 'AC'
                      ? 'bg-white text-[#005BAA] shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Area Coordinator ({acList.length})</span>
                </button>
              </div>
            </div>

            {/* Table Area Manager (AM) */}
            {roleTab === 'AM' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Area Manager (AM)</th>
                      <th className="py-2.5 px-3">∑Store - JTJ</th>
                      <th className="py-2.5 px-3">Actual Sales</th>
                      <th className="py-2.5 px-3">Target Sales</th>
                      <th className="py-2.5 px-3">Achv Sales</th>
                      <th className="py-2.5 px-3">Actual Qty</th>
                      <th className="py-2.5 px-3">Point Score</th>
                      <th className="py-2.5 px-3">Stock (pcs)</th>
                      <th className="py-2.5 px-3">DSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {amList.map((am, idx) => (
                      <tr key={am.am} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{am.no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{formatAmName(am.am, idx)}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{am.store_ratio}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{formatRupiah(am.actual_net_sales)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatRupiah(am.target_net_sales)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(am.acv_net_sales)}</td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.actual_qty)} pcs</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {am.point ? (am.point * 100).toFixed(2) + ' pts' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.stock_pcs)}</td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.dsi, 1)} hari</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Area Coordinator (AC) */}
            {roleTab === 'AC' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Area Coordinator (AC)</th>
                      <th className="py-2.5 px-3">∑Store - JTJ</th>
                      <th className="py-2.5 px-3">Actual Sales</th>
                      <th className="py-2.5 px-3">Target Sales</th>
                      <th className="py-2.5 px-3">Achv Sales</th>
                      <th className="py-2.5 px-3">Actual Qty</th>
                      <th className="py-2.5 px-3">Point Score</th>
                      <th className="py-2.5 px-3">Stock (pcs)</th>
                      <th className="py-2.5 px-3">DSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {acList.map((ac, idx) => (
                      <tr key={ac.ac} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{ac.no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{formatAcName(ac.ac, idx)}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{ac.store_ratio}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{formatRupiah(ac.actual_net_sales)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatRupiah(ac.target_net_sales)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(ac.acv_net_sales)}</td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.actual_qty)} pcs</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {ac.point ? (ac.point * 100).toFixed(2) + ' pts' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.stock_pcs)}</td>
                        <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.dsi, 1)} hari</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top 10 Stores for this Brand */}
          {storeList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-emerald-600" />
                Top 10 Toko dengan Point Tertinggi – {selectedBrand}
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Rank</th>
                      <th className="py-2 px-3">Kode</th>
                      <th className="py-2 px-3">Nama Toko</th>
                      <th className="py-2 px-3">AM</th>
                      <th className="py-2 px-3">AC</th>
                      <th className="py-2 px-3">Actual Sales</th>
                      <th className="py-2 px-3">Actual Qty</th>
                      <th className="py-2 px-3">Point Score</th>
                      <th className="py-2 px-3 text-center">Status TF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeList.slice(0, 10).map((st, idx) => {
                      const isAbove = (st.point || 0) >= data.meta.time_factor;
                      return (
                        <tr key={st.kode} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">{st.kode}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{st.nama}</td>
                          <td className="py-2 px-3 text-slate-600">{st.am}</td>
                          <td className="py-2 px-3 text-slate-600">{st.ac}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{formatRupiah(st.actual_net_sales)}</td>
                          <td className="py-2 px-3 text-slate-700">{formatNumber(st.actual_qty)}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {st.point ? (st.point * 100).toFixed(2) + ' pts' : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
          )}

          {/* Products under this Brand */}
          {brandProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-blue-600" />
                Daftar Produk / PLU ({brandProducts.length} Produk)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">PLU</th>
                      <th className="py-2 px-3">Deskripsi Produk</th>
                      <th className="py-2 px-3 text-right">Qty Sales</th>
                      <th className="py-2 px-3 text-right">Net Sales</th>
                      <th className="py-2 px-3 text-right">Margin Rp</th>
                      <th className="py-2 px-3 text-right">Good Stock</th>
                      <th className="py-2 px-3 text-right">PKM</th>
                      <th className="py-2 px-3 text-right">MPKM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {brandProducts.map((p) => (
                      <tr key={p.plu} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-600">{p.plu}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{p.descp}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800">{formatNumber(p.qty_sales)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-800">{formatRupiah(p.net_sales)}</td>
                        <td className="py-2 px-3 text-right text-emerald-700">{formatRupiah(p.margin_rp)}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{formatNumber(p.good_stok)}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatNumber(p.pkm_qty)}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatNumber(p.mpkm_qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Detail Brand RPM Alfamidi • {selectedBrand}</span>
          <button
            onClick={() => setSelectedBrand(null)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
