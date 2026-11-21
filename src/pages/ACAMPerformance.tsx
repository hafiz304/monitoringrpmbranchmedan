import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  Users,
  Award,
  TrendingUp,
  Package,
  Receipt,
  DollarSign,
  ChevronRight,
  Filter,
  BarChart3,
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
} from 'recharts';

export const ACAMPerformance: React.FC = () => {
  const { data } = useDashboard();

  const brands = useMemo(() => {
    return (data.meta.brands && data.meta.brands.length > 0)
      ? data.meta.brands
      : Object.keys(data.resume_brands);
  }, [data]);

  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('');
  const [activeAmDetail, setActiveAmDetail] = useState<string | null>(null);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'AM' | 'AC'>('AM');

  const activeBrand = useMemo(() => {
    if (selectedBrandFilter && brands.includes(selectedBrandFilter)) {
      return selectedBrandFilter;
    }
    return brands[0] || '';
  }, [selectedBrandFilter, brands]);

  // Current brand AM rows (5 Area Managers)
  const currentBrandAmRows = useMemo(() => {
    return data.acam_data[activeBrand] || [];
  }, [data, activeBrand]);

  // Current brand AC rows (20 Area Coordinators)
  const currentBrandAcRows = useMemo(() => {
    return data.ac_brand_data?.[activeBrand] || [];
  }, [data, activeBrand]);

  // Overall AM Performance from RESUME
  const amResumeList = data.resume_am_ranking;

  // AC Ranking list from RESUME
  const acResumeList = data.resume_ac_ranking;

  // Helper to map and format AM names safely without duplicating prefixes or showing numeric placeholders
  const formatAmName = (name: string | undefined | null, index?: number) => {
    if (!name) return 'AM';
    let str = String(name).trim();
    // If str is purely numeric (e.g. "1", "2"), try to lookup from stores
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const uniqueAms = Array.from(new Set(data.stores.map((s) => s.am).filter((s) => s && !/^\d+$/.test(s))));
      if (uniqueAms[idx]) {
        str = uniqueAms[idx];
      } else if (index !== undefined && uniqueAms[index]) {
        str = uniqueAms[index];
      }
    }
    // Remove duplicate prefix if present
    str = str.replace(/^AM\s*[-.:]?\s*/i, '').trim();
    return `AM ${str}`;
  };

  // Helper to map and format AC names safely without duplicating prefixes or showing numeric placeholders
  const formatAcName = (name: string | undefined | null, index?: number) => {
    if (!name) return 'AC';
    let str = String(name).trim();
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const uniqueAcs = Array.from(new Set(data.stores.map((s) => s.ac).filter((s) => s && !/^\d+$/.test(s))));
      if (uniqueAcs[idx]) {
        str = uniqueAcs[idx];
      } else if (index !== undefined && uniqueAcs[index]) {
        str = uniqueAcs[index];
      }
    }
    str = str.replace(/^AC\s*[-.:]?\s*/i, '').trim();
    return `AC ${str}`;
  };

  // Chart data for AM comparison in current brand
  const chartData = currentBrandAmRows.map((am, idx) => ({
    name: formatAmName(am.am, idx),
    actualSales: (am.actual_net_sales || 0) / 1_000_000,
    targetSales: (am.target_net_sales || 0) / 1_000_000,
    point: (am.point || 0) * 100,
    dsi: am.dsi || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AC - AM Performance Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi pencapaian target, Point Score, Stock in Pcs, ASQ (Average Sales Qty), dan DSI (Days Sales Inventory) Area Manager & Area Coordinator
          </p>
        </div>

        {/* Brand Selector for AC-AM Deep Dive */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Pilih Brand:</span>
          <select
            value={activeBrand}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-bold text-alfamidi-red shadow-xs focus:ring-1 focus:ring-alfamidi-red"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                Brand {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AM Ranking Summary Cards (from RESUME) */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-alfamidi-red" />
          Ranking Keseluruhan {amResumeList.length} Area Manager (AM)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {amResumeList.map((am, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={am.am}
                onClick={() => setActiveAmDetail(activeAmDetail === am.am ? null : am.am)}
                className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                  activeAmDetail === am.am
                    ? 'border-alfamidi-red ring-2 ring-red-100'
                    : isTop
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      isTop ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{am.rank}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {formatAmName(am.am, idx)}
                  </span>
                </div>

                <p className="text-lg font-black text-slate-900 mt-2">
                  {formatAmName(am.am, idx)}
                </p>

                {/* Dynamic Brand values for this AM */}
                <div className="mt-3 space-y-1.5 text-[11px] pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                  {brands.map((b) => {
                    const val = am.brand_values?.[b] !== undefined
                      ? am.brand_values[b]
                      : (am as any)[b.toLowerCase().replace(/[^a-z0-9]/g, '')];
                    return (
                      <div key={b} className="flex justify-between items-center">
                        <span className="text-slate-500 truncate mr-1">{b}:</span>
                        <span className="font-semibold text-slate-800 shrink-0">
                          {formatPercent(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target vs Actual Chart per AM for Selected Brand */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-alfamidi-red" />
              Perbandingan Target vs Actual Net Sales AM – Brand {activeBrand}
            </h2>
            <p className="text-xs text-slate-500">Angka dalam satuan Juta Rupiah</p>
          </div>
          <span className="text-xs text-slate-500">Data Sheet: AC-AM {activeBrand}</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `Rp ${val}M`} />
              <Tooltip
                formatter={(val: number, name: string) => [
                  `Rp ${val.toFixed(2)} Juta`,
                  name === 'actualSales' ? 'Aktual' : 'Target',
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
              <Bar dataKey="targetSales" name="Target Net Sales" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualSales" name="Aktual Net Sales" fill="#D71920" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AM & AC Detail Table for Selected Brand */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {selectedRoleTab === 'AM'
                ? `Tabel Performa Area Manager (AM) – Brand ${activeBrand}`
                : `Tabel Performa Area Coordinator (AC) – Brand ${activeBrand}`}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedRoleTab === 'AM'
                ? `Data performa 5 Area Manager pada brand ${activeBrand}`
                : `Data performa ${currentBrandAcRows.length} Area Coordinator pada brand ${activeBrand}`}
            </p>
          </div>

          {/* Toggle Role Tab */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setSelectedRoleTab('AM')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'AM'
                  ? 'bg-white text-alfamidi-red shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Area Manager ({currentBrandAmRows.length})
            </button>
            <button
              onClick={() => setSelectedRoleTab('AC')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'AC'
                  ? 'bg-white text-[#005BAA] shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Area Coordinator ({currentBrandAcRows.length})
            </button>
          </div>
        </div>

        {selectedRoleTab === 'AM' ? (
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
                  <th className="py-2.5 px-3">Target Qty</th>
                  <th className="py-2.5 px-3">Achv Qty</th>
                  <th className="py-2.5 px-3">Point Score</th>
                  <th className="py-2.5 px-3">Stock (pcs)</th>
                  <th className="py-2.5 px-3">ASQ (pcs/hari)</th>
                  <th className="py-2.5 px-3">DSI (hari)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentBrandAmRows.map((am, idx) => (
                  <tr key={am.am} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{am.no}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatAmName(am.am, idx)}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{am.store_ratio}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{formatRupiah(am.actual_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatRupiah(am.target_net_sales)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(am.acv_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.actual_qty)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatNumber(am.target_qty)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(am.acv_qty)}</td>
                    <td className="py-2.5 px-3 font-black text-slate-900">
                      {am.point ? (am.point * 100).toFixed(2) + ' pts' : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.stock_pcs)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(am.asq, 1)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatNumber(am.dsi, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
                  <th className="py-2.5 px-3">Target Qty</th>
                  <th className="py-2.5 px-3">Achv Qty</th>
                  <th className="py-2.5 px-3">Point Score</th>
                  <th className="py-2.5 px-3">Stock (pcs)</th>
                  <th className="py-2.5 px-3">ASQ (pcs/hari)</th>
                  <th className="py-2.5 px-3">DSI (hari)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentBrandAcRows.map((ac, idx) => (
                  <tr key={ac.ac} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{ac.no}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatAcName(ac.ac, idx)}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{ac.store_ratio}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{formatRupiah(ac.actual_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatRupiah(ac.target_net_sales)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(ac.acv_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.actual_qty)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatNumber(ac.target_qty)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(ac.acv_qty)}</td>
                    <td className="py-2.5 px-3 font-black text-slate-900">
                      {ac.point ? (ac.point * 100).toFixed(2) + ' pts' : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.stock_pcs)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(ac.asq, 1)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatNumber(ac.dsi, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AC Ranking Table (from RESUME) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Ranking Seluruh Area Coordinator (AC) – {acResumeList.length} AC
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Rekapitulasi pencapaian {acResumeList.length} AC di bawah Alfamidi Branch Medan terhadap {brands.length} brand program RPM
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Nama AC</th>
                {brands.map((b) => (
                  <th key={b} className="py-2.5 px-3 text-center whitespace-nowrap">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {acResumeList.map((ac, idx) => (
                <tr key={ac.ac} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-500">#{ac.rank}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{formatAcName(ac.ac, idx)}</td>
                  {brands.map((b) => {
                    const val = ac.brand_values?.[b] !== undefined
                      ? ac.brand_values[b]
                      : (ac as any)[b.toLowerCase().replace(/[^a-z0-9]/g, '')];
                    return (
                      <td key={b} className="py-2.5 px-3 text-center font-medium">
                        {formatPercent(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
