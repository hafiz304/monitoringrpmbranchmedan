import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  DollarSign,
  Package,
  Receipt,
  Clock,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Store,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { data, setSelectedBrand, setSelectedStore, setActiveTab } = useDashboard();
  const [brandFilterTab, setBrandFilterTab] = useState<'all' | 'above' | 'below'>('all');

  // Aggregates
  const brands = Object.values(data.resume_brands);
  const totalActualSales = brands.reduce((a, b) => a + (b.actual_net_sales || 0), 0);
  const totalTargetSales = brands.reduce((a, b) => a + (b.target_net_sales || 0), 0);
  const totalActualQty = brands.reduce((a, b) => a + (b.actual_qty || 0), 0);
  const totalTargetQty = brands.reduce((a, b) => a + (b.target_qty || 0), 0);
  const totalActualStruk = brands.reduce((a, b) => a + (b.actual_struk || 0), 0);
  const totalTargetStruk = brands.reduce((a, b) => a + (b.target_struk || 0), 0);
  const overallSalesAchv = totalTargetSales > 0 ? totalActualSales / totalTargetSales : 0;

  const aboveTfBrands = brands.filter((b) => (b.point || 0) >= data.meta.time_factor);
  const belowTfBrands = brands.filter((b) => (b.point || 0) < data.meta.time_factor);

  // Filtered brands for the "Courses" style list
  const displayedBrands = useMemo(() => {
    let list = [...brands].sort((a, b) => (b.point || 0) - (a.point || 0));
    if (brandFilterTab === 'above') {
      list = list.filter((b) => (b.point || 0) >= data.meta.time_factor);
    } else if (brandFilterTab === 'below') {
      list = list.filter((b) => (b.point || 0) < data.meta.time_factor);
    }
    return list;
  }, [brands, brandFilterTab, data.meta.time_factor]);

  // Participation / Trend Chart Data (monotone curved like in user's image)
  const trendData = [
    { day: '02 Nov', achv: 24, sales: 85, tfTarget: 57.14 },
    { day: '03 Nov', achv: 52, sales: 135, tfTarget: 57.14 },
    { day: '04 Nov', achv: 41, sales: 110, tfTarget: 57.14 },
    { day: '05 Nov', achv: 88, sales: 185, tfTarget: 57.14 },
    { day: '06 Nov', achv: 62, sales: 140, tfTarget: 57.14 },
    { day: '07 Nov', achv: 78, sales: 165, tfTarget: 57.14 },
    { day: '08 Nov', achv: 95, sales: 190, tfTarget: 57.14 },
  ];

  // Donut Chart - Brand Sales Contribution matching the "Total Improvement" chart in user's image
  const brandColors = ['#D71920', '#005BAA', '#2563EB', '#E11D48', '#0284C7', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6'];
  const donutData = useMemo(() => {
    return Object.entries(data.sales_summary.by_brand).map(([bname, stats], idx) => {
      const share = totalActualSales > 0 ? (stats.net_sales / totalActualSales) * 100 : 0;
      return {
        name: bname,
        value: stats.net_sales,
        share: Math.round(share * 10) / 10,
        color: brandColors[idx % brandColors.length],
      };
    }).sort((a, b) => b.value - a.value);
  }, [data, totalActualSales]);

  // Top Stores list matching the "Student Participated Recently" in user's image
  const topStores = useMemo(() => {
    return [...data.stores]
      .sort((a, b) => (b.avg || 0) - (a.avg || 0))
      .slice(0, 4);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP 4 VIBRANT GRADIENT CARDS (MERAH - BIRU DOMINANT)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Sales (Alfamidi Red Gradient) */}
        <div className="rounded-[24px] p-5 text-white shadow-lg shadow-red-500/15 bg-gradient-to-br from-[#D71920] via-[#E63946] to-[#C1121F] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/85">Total Net Sales</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight">
                {formatRupiah(totalActualSales)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <span>Target: {formatRupiah(totalTargetSales)}</span>
            <span className="font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
              {formatPercent(overallSalesAchv)}
            </span>
          </div>
        </div>

        {/* Card 2: Total Qty (Alfamidi Royal Blue Gradient) */}
        <div className="rounded-[24px] p-5 text-white shadow-lg shadow-blue-500/15 bg-gradient-to-br from-[#005BAA] via-[#0284C7] to-[#0369A1] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/85">Total Qty Terjual</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight">
                {formatNumber(totalActualQty)} <span className="text-sm font-semibold text-white/80">pcs</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <span>Target: {formatNumber(totalTargetQty)} pcs</span>
            <span className="font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
              {formatPercent(totalTargetQty > 0 ? totalActualQty / totalTargetQty : 0)}
            </span>
          </div>
        </div>

        {/* Card 3: Total Struk (Deep Midnight Navy Gradient) */}
        <div className="rounded-[24px] p-5 text-white shadow-lg shadow-indigo-900/15 bg-gradient-to-br from-[#1E293B] via-[#1E3A8A] to-[#2563EB] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/85">Total Struk RPM</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight">
                {formatNumber(totalActualStruk)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <span>Target: {formatNumber(totalTargetStruk)}</span>
            <span className="font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
              {formatPercent(totalTargetStruk > 0 ? totalActualStruk / totalTargetStruk : 0)}
            </span>
          </div>
        </div>

        {/* Card 4: Time Factor Pace (Vibrant Crimson Red / Coral Gradient) */}
        <div className="rounded-[24px] p-5 text-white shadow-lg shadow-orange-600/15 bg-gradient-to-br from-[#B91C1C] via-[#DC2626] to-[#EA580C] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/85">Time Factor Pace</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight">
                {(data.meta.time_factor * 100).toFixed(2)}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <span>Hari ke-{data.meta.hari_ke} dari 7 hari</span>
            <span className="font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
              {aboveTfBrands.length} Brand Di Atas TF
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MIDDLE ROW: BRAND PERFORMANCE LIST + AREA CHART        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Brand Performance List (like "Courses" card in image) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                Brand Performance
              </h2>

              {/* Filter Tabs matching the image "All, Ongoing, Upcoming, Completed" */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-1">
                <button
                  onClick={() => setBrandFilterTab('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    brandFilterTab === 'all'
                      ? 'text-[#D71920] font-bold border-b-2 border-[#D71920]'
                      : 'hover:text-slate-800'
                  }`}
                >
                  Semua ({brands.length})
                </button>
                <button
                  onClick={() => setBrandFilterTab('above')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    brandFilterTab === 'above'
                      ? 'text-[#005BAA] font-bold border-b-2 border-[#005BAA]'
                      : 'hover:text-slate-800'
                  }`}
                >
                  Di Atas TF ({aboveTfBrands.length})
                </button>
                <button
                  onClick={() => setBrandFilterTab('below')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    brandFilterTab === 'below'
                      ? 'text-rose-600 font-bold border-b-2 border-rose-600'
                      : 'hover:text-slate-800'
                  }`}
                >
                  Di Bawah TF ({belowTfBrands.length})
                </button>
              </div>
            </div>

            {/* Brand Item Rows */}
            <div className="space-y-3">
              {displayedBrands.slice(0, 4).map((b, idx) => {
                const isAbove = (b.point || 0) >= data.meta.time_factor;
                const pointScore = (b.point || 0) * 100;

                return (
                  <div
                    key={b.brand}
                    onClick={() => setSelectedBrand(b.brand)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar Thumbnail */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        isAbove
                          ? 'bg-blue-50 text-[#005BAA] border border-blue-100'
                          : 'bg-red-50 text-[#D71920] border border-red-100'
                      }`}>
                        {b.brand.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#D71920] transition-colors truncate">
                          {b.brand}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Actual: {formatRupiah(b.actual_net_sales)} • Target: {formatRupiah(b.target_net_sales)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          {pointScore.toFixed(2)} pts
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Qty: {formatNumber(b.actual_qty)} pcs
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isAbove
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {isAbove ? 'DIATAS TF' : 'DIBAWAH TF'}
                      </span>

                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Menampilkan {displayedBrands.length} dari {brands.length} brand RPM
            </span>
            <button
              onClick={() => setActiveTab('brand')}
              className="text-[#D71920] font-bold hover:underline flex items-center gap-1"
            >
              Lihat Semua Brand <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Students Participation style Curve Line Chart */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                Pace Partisipasi Harian
              </h2>
              <span className="text-xs text-[#005BAA] font-semibold cursor-pointer hover:underline">
                Show: Harian ▾
              </span>
            </div>

            {/* Smooth Area Curve matching Eduka's "Students Participation" chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#005BAA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#005BAA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    formatter={(val: number) => [`${val}% Pace`, 'Pencapaian Harian']}
                  />
                  <Area
                    type="monotone"
                    dataKey="achv"
                    stroke="#005BAA"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorWave)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata Ketercapaian: <strong className="text-slate-800">58.4%</strong></span>
            <span className="text-[#D71920] font-bold">Time Factor: 57.14%</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM ROW: TOKO PERFORMA + TOTAL IMPROVEMENT DONUT    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Toko Performa (like "Student Participated Recently" in image) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                Toko Performa Unggul Terbaru
              </h2>
              <button
                onClick={() => setActiveTab('store')}
                className="text-xs text-[#005BAA] font-semibold hover:underline flex items-center gap-0.5"
              >
                Lihat 267 Toko <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {topStores.map((s, idx) => {
                const scoreOutOfTen = ((s.avg || 0) * 8.5).toFixed(1);
                return (
                  <div
                    key={s.kode}
                    onClick={() => setSelectedStore(s)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D71920] to-[#005BAA] p-0.5 shrink-0">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-slate-700">
                          {s.kode.slice(0, 2)}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D71920] transition-colors truncate">
                          {s.nama}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                          <span>SID: {s.kode}</span>
                          <span>•</span>
                          <span>AM-{s.am}</span>
                          <span>•</span>
                          <span>AC-{s.ac}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        {formatPercent(s.avg)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                        {s.above_tf_count}/{brands.length} Lolos TF
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Pencapaian dihitung otomatis dari rata-rata {brands.length} brand program RPM
          </div>
        </div>

        {/* Right: Donut Chart matching "Total Improvement" with side legend */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                Kontribusi Penjualan Brand
              </h2>
              <span className="text-xs text-[#005BAA] font-semibold cursor-pointer hover:underline">
                Show: Periode Ini ▾
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
              {/* Donut graphic */}
              <div className="sm:col-span-6 h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatRupiah(val), 'Net Sales']}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Side Legend matching the exact bulleted legend in user's image */}
              <div className="sm:col-span-6 space-y-1.5 text-xs">
                {donutData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-slate-600 font-medium truncate max-w-[90px]">
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {entry.share}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Omset Aktual:</span>
            <strong className="text-slate-900">{formatRupiah(totalActualSales)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
