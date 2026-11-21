import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  Award,
  TrendingUp,
  Package,
  Receipt,
  DollarSign,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
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
  ReferenceLine,
} from 'recharts';

export const BrandPerformance: React.FC = () => {
  const { data, setSelectedBrand } = useDashboard();
  const [metricTab, setMetricTab] = useState<'sales' | 'qty' | 'struk'>('sales');

  const brands = Object.values(data.resume_brands);

  // Chart data
  const chartData = brands.map((b) => {
    let actual = 0;
    let target = 0;
    let unit = '';
    if (metricTab === 'sales') {
      actual = (b.actual_net_sales || 0) / 1_000_000;
      target = (b.target_net_sales || 0) / 1_000_000;
      unit = 'Juta Rp';
    } else if (metricTab === 'qty') {
      actual = b.actual_qty || 0;
      target = b.target_qty || 0;
      unit = 'pcs';
    } else {
      actual = b.actual_struk || 0;
      target = b.target_struk || 0;
      unit = 'struk';
    }

    return {
      name: b.brand,
      Actual: actual,
      Target: target,
      point: (b.point || 0) * 100,
      achvSales: (b.acv_net_sales || 0) * 100,
      achvQty: (b.acv_qty || 0) * 100,
      achvStruk: (b.acv_struk || 0) * 100,
      unit,
    };
  }).sort((a, b) => b.point - a.point);

  // Time factor benchmark in percentage
  const tfPercent = data.meta.time_factor * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Brand Performance ({brands.length} Brand RPM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring performa Struk, Qty, Net Sales, Point Score, dan DSI seluruh brand program RPM Alfamidi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-alfamidi-red" />
            <span>Time Factor Target: {tfPercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {brands.map((b) => {
          const isAboveTf = (b.point || 0) >= data.meta.time_factor;
          const pointScore = (b.point || 0) * 100;

          return (
            <div
              key={b.brand}
              onClick={() => setSelectedBrand(b.brand)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      BRAND RPM
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-alfamidi-red transition-colors">
                      {b.brand}
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAboveTf ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isAboveTf ? 'DIATAS TF' : 'DIBAWAH TF'}
                  </span>
                </div>

                {/* Point Performance Pill */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Point Score:</span>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{pointScore.toFixed(2)} pts</span>
                    <span className="text-[10px] text-slate-500 block">
                      TF Ref: {tfPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Indicators Table */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Net Sales:
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{formatRupiah(b.actual_net_sales)}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Achv: {formatPercent(b.acv_net_sales)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-slate-400" /> Qty:
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{formatNumber(b.actual_qty)} pcs</span>
                      <span className="text-[10px] text-slate-500 block">
                        Achv: {formatPercent(b.acv_qty)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" /> Struk:
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{formatNumber(b.actual_struk)}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Achv: {formatPercent(b.acv_struk)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Stock & DSI */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>DSI: <strong className="text-slate-700">{formatNumber(b.dsi, 1)} hari</strong></span>
                <span className="text-alfamidi-red font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Chart Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-alfamidi-red" />
              Perbandingan Target vs Aktual {brands.length} Brand
            </h2>
            <p className="text-xs text-slate-500">
              Pilih metrik perbandingan (Net Sales, Kuantitas Qty, atau Frekuensi Struk)
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setMetricTab('sales')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                metricTab === 'sales'
                  ? 'bg-white text-alfamidi-red shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Sales (Juta Rp)
            </button>
            <button
              onClick={() => setMetricTab('qty')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                metricTab === 'qty'
                  ? 'bg-white text-alfamidi-red shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kuantitas Qty (pcs)
            </button>
            <button
              onClick={() => setMetricTab('struk')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                metricTab === 'struk'
                  ? 'bg-white text-alfamidi-red shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frekuensi Struk
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: number, name: string) => [
                  `${formatNumber(val)} ${metricTab === 'sales' ? 'Juta Rp' : metricTab === 'qty' ? 'pcs' : 'struk'}`,
                  name,
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
              <Bar dataKey="Target" name="Target" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" name="Aktual" fill="#D71920" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Tabel Detail Performa {brands.length} Brand</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Actual Sales</th>
                <th className="py-2.5 px-3">Target Sales</th>
                <th className="py-2.5 px-3">Achv Sales</th>
                <th className="py-2.5 px-3">Actual Qty</th>
                <th className="py-2.5 px-3">Target Qty</th>
                <th className="py-2.5 px-3">Achv Qty</th>
                <th className="py-2.5 px-3">Actual Struk</th>
                <th className="py-2.5 px-3">Achv Struk</th>
                <th className="py-2.5 px-3">Point</th>
                <th className="py-2.5 px-3 text-center">Status TF</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map((b) => {
                const isAbove = (b.point || 0) >= data.meta.time_factor;
                return (
                  <tr key={b.brand} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.brand}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{formatRupiah(b.actual_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatRupiah(b.target_net_sales)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(b.acv_net_sales)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(b.actual_qty)} pcs</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatNumber(b.target_qty)} pcs</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(b.acv_qty)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatNumber(b.actual_struk)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatPercent(b.acv_struk)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {b.point ? (b.point * 100).toFixed(2) + ' pts' : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAbove ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isAbove ? 'DIATAS TF' : 'DIBAWAH TF'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedBrand(b.brand)}
                        className="text-alfamidi-red hover:underline font-semibold"
                      >
                        Lihat Store
                      </button>
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
