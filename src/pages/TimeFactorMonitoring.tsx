import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatPercent, getMatrixHeatmapColor } from '../utils/formatters';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingDown,
  Store,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const TimeFactorMonitoring: React.FC = () => {
  const { data, setSelectedStore, setSelectedBrand } = useDashboard();

  const timeFactor = data.meta.time_factor;
  const tfPercent = timeFactor * 100;

  // Store counts above vs below TF based on overall avg
  const storesAboveTf = useMemo(() => {
    return data.stores.filter((s) => (s.avg || 0) >= timeFactor);
  }, [data, timeFactor]);

  const storesBelowTf = useMemo(() => {
    return data.stores.filter((s) => (s.avg || 0) < timeFactor);
  }, [data, timeFactor]);

  const pctAboveTf = (storesAboveTf.length / data.stores.length) * 100;

  // Stores needing urgent attention: 0 or 1 brand above TF and avg < 0.40
  const urgentStores = useMemo(() => {
    return [...data.stores]
      .filter((s) => s.above_tf_count <= 1)
      .sort((a, b) => (a.avg || 0) - (b.avg || 0));
  }, [data]);

  // Brand Time Factor Breakdown
  const brandTfData = useMemo(() => {
    return Object.values(data.resume_brands).map((b) => {
      const point = (b.point || 0) * 100;
      const isAbove = point >= tfPercent;
      return {
        brand: b.brand,
        point,
        status: isAbove ? 'DIATAS TF' : 'DIBAWAH TF',
        shortageQty: b.shortage_qty || 0,
      };
    }).sort((a, b) => b.point - a.point);
  }, [data, tfPercent]);

  const donutData = [
    { name: `Di Atas Time Factor (>= ${tfPercent.toFixed(1)}%)`, value: storesAboveTf.length, color: '#10B981' },
    { name: `Di Bawah Time Factor (< ${tfPercent.toFixed(1)}%)`, value: storesBelowTf.length, color: '#F43F5E' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Time Factor Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis ketepatan pencapaian target berdasarkan Time Factor operasional toko dan brand RPM
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-alfamidi-red font-bold text-xs flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>HARI KE-{data.meta.hari_ke} DARI 7 • TIME FACTOR: {tfPercent.toFixed(2)}%</span>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Time Factor Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Benchmark Time Factor</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-alfamidi-red flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {tfPercent.toFixed(2)}%
          </p>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Hari ke-{data.meta.hari_ke} dari 7 hari</span>
            <span className="font-semibold text-slate-700">Pace Harian</span>
          </div>
        </div>

        {/* Card 2: Toko Di Atas TF */}
        <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Toko Di Atas TF</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-2">
            {storesAboveTf.length} <span className="text-sm font-semibold text-emerald-700">Toko</span>
          </p>
          <div className="mt-2 text-xs text-emerald-800 pt-2 border-t border-emerald-200 flex items-center justify-between">
            <span>Rasio Ketercapaian:</span>
            <span className="font-bold">{pctAboveTf.toFixed(1)}% dari Total</span>
          </div>
        </div>

        {/* Card 3: Toko Di Bawah TF */}
        <div className="bg-rose-50/70 rounded-xl border border-rose-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Toko Di Bawah TF</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-950 mt-2">
            {storesBelowTf.length} <span className="text-sm font-semibold text-rose-700">Toko</span>
          </p>
          <div className="mt-2 text-xs text-rose-800 pt-2 border-t border-rose-200 flex items-center justify-between">
            <span>Rasio Tertinggal:</span>
            <span className="font-bold">{(100 - pctAboveTf).toFixed(1)}% dari Total</span>
          </div>
        </div>

        {/* Card 4: Toko Kritis */}
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Toko Perhatian Khusus</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-2">
            {urgentStores.length} <span className="text-sm font-semibold text-amber-700">Toko</span>
          </p>
          <div className="mt-2 text-xs text-amber-800 pt-2 border-t border-amber-200 flex items-center justify-between">
            <span>&le; 1 Brand Di Atas TF</span>
            <span className="font-bold">Prioritas AM/AC</span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Above vs Below */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Proporsi Ketercapaian Toko</h2>
            <p className="text-xs text-slate-500 mb-4">Distribusi toko terhadap Time Factor ({tfPercent.toFixed(1)}%)</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} Toko (${((val / data.stores.length) * 100).toFixed(1)}%)`, 'Jumlah Toko']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Total Toko Teranalisis: <strong className="text-slate-800">{data.stores.length} Toko</strong>
          </div>
        </div>

        {/* Bar Chart: Brand Performance vs Time Factor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Pencapaian Point 7 Brand vs Time Factor
              </h2>
              <p className="text-xs text-slate-500">
                Garis merah menunjukkan batas minimum Time Factor periode ({tfPercent.toFixed(2)} pts)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandTfData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(2)} pts`, 'Point Score']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
                <ReferenceLine
                  y={tfPercent}
                  label={{ value: `TF: ${tfPercent.toFixed(1)}%`, fill: '#D71920', fontSize: 11, position: 'top' }}
                  stroke="#D71920"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                <Bar dataKey="point" name="Point Score" radius={[4, 4, 0, 0]}>
                  {brandTfData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.point >= tfPercent ? '#10B981' : '#F43F5E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent Attention Stores Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Toko yang Membutuhkan Perhatian Khusus ({urgentStores.length} Toko)
              </h2>
              <p className="text-xs text-slate-500">
                Toko dengan hanya 0 - 1 brand yang mencapai Time Factor. Butuh pendampingan Area Coordinator (AC).
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Nama Toko</th>
                <th className="py-2.5 px-3 text-center">AM</th>
                <th className="py-2.5 px-3 text-center">AC</th>
                <th className="py-2.5 px-3 text-center">Brand &gt;= TF</th>
                <th className="py-2.5 px-3 text-right">Rata-rata Achv</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {urgentStores.slice(0, 15).map((s) => (
                <tr
                  key={s.kode}
                  onClick={() => setSelectedStore(s)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.kode}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{s.nama}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{s.am}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{s.ac}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                    {s.above_tf_count} dari 7 Brand
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-700">
                    {formatPercent(s.avg)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> Kritis
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedStore(s)}
                      className="text-alfamidi-red hover:underline font-semibold"
                    >
                      Audit Toko
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
