import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  Lightbulb,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Package,
  Award,
  Users,
  Store,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface InsightItem {
  id: number;
  category: string;
  title: string;
  targetEntity: string;
  actualValue: string;
  benchmarkValue: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  problemStatement: string;
  recommendations: string[];
  icon: React.ElementType;
}

export const ActionableInsights: React.FC = () => {
  const { data, setActiveTab, setSelectedBrand, setSelectedStore } = useDashboard();

  const insights: InsightItem[] = useMemo(() => {
    const brandsList = (data.meta.brands && data.meta.brands.length > 0)
      ? data.meta.brands
      : Object.keys(data.resume_brands);

    // 1. Brand with lowest achievement
    const brandsSorted = Object.values(data.resume_brands).sort(
      (a, b) => (a.point || 0) - (b.point || 0)
    );
    const lowestBrand = brandsSorted[0] || { brand: 'RPM', point: 0, acv_net_sales: 0, target_net_sales: 0, shortage_qty: 0, dsi: 0 };

    // 2. Stores below TF
    const storesBelowTf = data.stores.filter((s) => (s.avg || 0) < data.meta.time_factor);

    // 3. Stores with severe underperformance (<= 1 brand above TF)
    const severeUnderperformingStores = data.stores.filter((s) => s.above_tf_count <= 1);

    // 4. AM with lowest achievement
    const amRanking = data.resume_am_ranking;
    const lowestAm = amRanking[amRanking.length - 1];

    // 5. Product with highest sales
    const sortedProducts = [...data.products].sort((a, b) => b.net_sales - a.net_sales);
    const topProduct = sortedProducts[0];

    // 6. Products with low sales but high stock
    const slowMovingWithHighStock = data.products.filter(
      (p) => p.qty_sales > 0 && p.qty_sales < 100 && p.good_stok > 1000
    );

    // 7. Products requiring restock (Good Stock < MPKM)
    const understockedItems = data.stock_rows_sample.filter((s) => s.good_stok < s.mpkm_qty);

    // 8. Brand with largest sales contribution
    const largestBrand = Object.values(data.resume_brands).sort(
      (a, b) => (b.actual_net_sales || 0) - (a.actual_net_sales || 0)
    )[0] || lowestBrand;
    const totalSales = Object.values(data.resume_brands).reduce(
      (acc, b) => acc + (b.actual_net_sales || 0),
      0
    );
    const largestBrandShare =
      totalSales > 0 ? ((largestBrand.actual_net_sales || 0) / totalSales) * 100 : 0;

    return [
      {
        id: 1,
        category: 'Performa Brand Kritis',
        title: `Pencapaian Terendah: Brand ${lowestBrand.brand}`,
        targetEntity: `Brand ${lowestBrand.brand}`,
        actualValue: `${((lowestBrand.point || 0) * 100).toFixed(2)} pts (Sales Achv: ${formatPercent(lowestBrand.acv_net_sales)})`,
        benchmarkValue: `Time Factor: ${(data.meta.time_factor * 100).toFixed(2)}% | Target Sales: ${formatRupiah(lowestBrand.target_net_sales)}`,
        priority: 'HIGH',
        problemStatement: `Brand ${lowestBrand.brand} mengalami defisit terbesar dengan kekurangan penjualan sebanyak ${formatNumber(lowestBrand.shortage_qty)} pcs dan DSI mencapai ${formatNumber(lowestBrand.dsi, 1)} hari.`,
        recommendations: [
          `Lakukan bundling promo produk ${lowestBrand.brand} dengan produk sembako/kebutuhan harian lokal di setiap kasir.`,
          `Intensifkan briefing harian kasir mengenai target suggestive selling minimal 5 transaksi produk ${lowestBrand.brand} per shift.`,
          `Pindahkan posisi pajangan ${lowestBrand.brand} ke eye-level dan dekat kasir untuk mendorong impulse buying.`,
        ],
        icon: AlertTriangle,
      },
      {
        id: 2,
        category: 'Monitoring Time Factor',
        title: `${storesBelowTf.length} Toko Berada di Bawah Time Factor Harian`,
        targetEntity: `${storesBelowTf.length} dari ${data.stores.length} Toko (${((storesBelowTf.length / (data.stores.length || 1)) * 100).toFixed(1)}%)`,
        actualValue: `Rata-rata Achv: ${formatPercent(storesBelowTf.length > 0 ? storesBelowTf.reduce((a, b) => a + (b.avg || 0), 0) / storesBelowTf.length : 0)}`,
        benchmarkValue: `Time Factor Periode: ${(data.meta.time_factor * 100).toFixed(2)}%`,
        priority: 'HIGH',
        problemStatement: `Mayoritas toko (${storesBelowTf.length} toko) tertinggal dari pace target hari ke-${data.meta.hari_ke}. Risiko tidak tercapainya target akhir periode monitoring RPM.`,
        recommendations: [
          `Terbitkan Surat Peringatan Kinerja Harian dari Area Manager kepada seluruh Area Coordinator terkait.`,
          `Lakukan monitoring bertingkat per 4 jam di grup koordinasi toko untuk mengevaluasi struk RPM kasir.`,
          `Prioritaskan kunjungan supervisi AC pada 20 toko terbawah dalam matriks pencapaian.`,
        ],
        icon: Clock,
      },
      {
        id: 3,
        category: 'Evaluasi Unit Toko Kritis',
        title: `${severeUnderperformingStores.length} Toko Gagal Mencapai Target di Hampir Semua Brand`,
        targetEntity: `${severeUnderperformingStores.length} Toko (Pencapaian ≤ 1 Brand di Atas TF)`,
        actualValue: `Maksimal 1 Brand lolos Time Factor`,
        benchmarkValue: `Target Minimal: ${Math.ceil(brandsList.length / 2)} dari ${brandsList.length} Brand di Atas TF`,
        priority: 'HIGH',
        problemStatement: `Toko-toko ini mengalami inefisiensi eksekusi program RPM menyeluruh dan berisiko menjadi dead weight performa cabang.`,
        recommendations: [
          `Lakukan audit operasional langsung oleh AM pada toko dengan kode ${severeUnderperformingStores.slice(0, 3).map((s) => s.kode).join(', ')}.`,
          `Periksa ketersediaan sarana promosi (wobbler, gondola display, flyer RPM) di area toko.`,
          `Lakukan retraining teknik penawaran produk pada personil toko (kasir & pramuniaga).`,
        ],
        icon: Store,
      },
      {
        id: 4,
        category: 'Evaluasi Manajemen Area',
        title: `Area Manager dengan Pencapaian Terendah: AM ${lowestAm?.am || 'Wilayah'}`,
        targetEntity: `Area Manager (AM) ${lowestAm?.am || 'Wilayah'}`,
        actualValue: `Peringkat #${lowestAm?.rank || amRanking.length} dari ${amRanking.length} Area Manager`,
        benchmarkValue: `Peringkat #${amRanking.length} dari ${amRanking.length} Area Manager`,
        priority: 'MEDIUM',
        problemStatement: `Area di bawah AM ${lowestAm?.am || 'Wilayah'} konsisten berada di kuadran terbawah di beberapa brand kunci periode ini.`,
        recommendations: [
          `Adakan sesi review khusus antara Branch Manager dan AM ${lowestAm?.am || 'Wilayah'} untuk membedah bottleneck wilayah.`,
          `Terapkan skema insentif percepatan atau peer-coaching dengan AM peringkat teratas.`,
          `Evaluasi distribusi beban target toko di bawah naungan AM terkait.`,
        ],
        icon: Users,
      },
      {
        id: 5,
        category: 'Peluang Pendapatan (Top Driver)',
        title: `Penyumbang Omset Terbesar: ${topProduct?.descp || 'Item Unggulan'}`,
        targetEntity: `PLU ${topProduct?.plu || '-'} – ${topProduct?.descp || 'Produk'}`,
        actualValue: `${formatRupiah(topProduct?.net_sales)} (${formatNumber(topProduct?.qty_sales)} pcs terjual)`,
        benchmarkValue: `Kontribusi Sales Tertinggi di Seluruh Produk RPM`,
        priority: 'LOW',
        problemStatement: `Produk ini merupakan anchor revenue utama cabang. Jangan sampai mengalami kekosongan persediaan (stock out).`,
        recommendations: [
          `Pastikan replenishment dari Alfamidi Branch Medan ke seluruh toko di-dispatch tepat waktu dengan service level 100%.`,
          `Pertahankan ketersediaan display minimal di rak depan dan kasir (choke point).`,
          `Manfaatkan momentum produk untuk cross-selling dengan item RPM lainnya.`,
        ],
        icon: TrendingUp,
      },
      {
        id: 6,
        category: 'Risiko Inventory (Slow Moving)',
        title: `${slowMovingWithHighStock.length} Produk Mengalami Penjualan Rendah dengan Stok Berlebih`,
        targetEntity: `${slowMovingWithHighStock.length} SKU RPM Teridentifikasi Overstocked`,
        actualValue: `Stok Toko: ${formatNumber(slowMovingWithHighStock.reduce((a, b) => a + b.good_stok, 0))} pcs (Sales: ${formatNumber(slowMovingWithHighStock.reduce((a, b) => a + b.qty_sales, 0))} pcs)`,
        benchmarkValue: `Ideal Turnover: Rasio Stok terhadap Penjualan ≤ 3x`,
        priority: 'MEDIUM',
        problemStatement: `Stok barang menumpuk di gudang toko mengikat modal kerja dan meningkatkan risiko barang rusak/expired (Bad Stock).`,
        recommendations: [
          `Hentikan order otomatis (freeze reorder) untuk SKU bersangkutan sampai stok toko terserap normal.`,
          `Berikan bonus poin kasir khusus untuk setiap penjualan produk slow moving yang berhasil.`,
          `Lakukan transfer stok antar-toko (inter-store transfer) ke toko yang memiliki demand lebih tinggi.`,
        ],
        icon: Package,
      },
      {
        id: 7,
        category: 'Peringatan Kekurangan Stok',
        title: `${understockedItems.length} Titik Produk Memiliki Good Stock di Bawah MPKM`,
        targetEntity: `${understockedItems.length} Baris Produk Toko Terindikasi Low Stock`,
        actualValue: `Good Stock < Nilai MPKM (Minimum Pajangan Kasir/Toko)`,
        benchmarkValue: `Batas Aman: Good Stock >= MPKM + Minor`,
        priority: 'HIGH',
        problemStatement: `Ketiadaan stok di rak display menyebabkan potensi lost sales pada saat pelanggan berminat membeli.`,
        recommendations: [
          `Segera kirimkan Purchase Order darurat (Emergency Replenishment) dari Alfamidi Branch Medan ke toko terdampak.`,
          `Instruksikan personil toko melakukan pengecekan stok fisik di gudang belakang toko apakah ada unrecorded stock.`,
          `Prioritaskan pengiriman harian bagi toko dengan sales turnover cepat.`,
        ],
        icon: AlertTriangle,
      },
      {
        id: 8,
        category: 'Analisis Portofolio Brand',
        title: `Penyumbang Revenue Terbesar: Brand ${largestBrand?.brand}`,
        targetEntity: `Brand ${largestBrand?.brand}`,
        actualValue: `${formatRupiah(largestBrand?.actual_net_sales)} (${largestBrandShare.toFixed(1)}% dari Total Omset RPM)`,
        benchmarkValue: `Target Brand Sales: ${formatRupiah(largestBrand?.target_net_sales)}`,
        priority: 'LOW',
        problemStatement: `Performa ${largestBrand?.brand} menjadi penopang utama pencapaian cabang pada periode ini.`,
        recommendations: [
          `Jadikan best practice strategi pemajangan dan suggestive selling brand ini sebagai acuan brand lain.`,
          `Apresiasi personil toko dan AM yang berhasil mengamankan pencapaian tertinggi pada brand ini.`,
          `Jaga kontinuitas pasokan produk varian terlaris brand ini dari pihak supplier/principal.`,
        ],
        icon: Award,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Actionable Insights & Prescriptive Decisions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekomendasi tindakan berbasis analisis data aktual Excel untuk memandu akselerasi performa RPM Alfamidi
        </p>
      </div>

      {/* Insights Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase">Prioritas Tinggi (Tindakan Segera)</span>
            <p className="text-lg font-black text-rose-950">
              {insights.filter((i) => i.priority === 'HIGH').length} Masalah Kritis
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase">Prioritas Menengah (Optimasi)</span>
            <p className="text-lg font-black text-amber-950">
              {insights.filter((i) => i.priority === 'MEDIUM').length} Area Peningkatan
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase">Pertahankan Keunggulan</span>
            <p className="text-lg font-black text-emerald-950">
              {insights.filter((i) => i.priority === 'LOW').length} Driver Sukses
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Actionable Insights Cards */}
      <div className="space-y-4">
        {insights.map((item) => {
          const Icon = item.icon;
          const isHigh = item.priority === 'HIGH';
          const isMed = item.priority === 'MEDIUM';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                isHigh
                  ? 'border-rose-200 hover:border-rose-300'
                  : isMed
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left: Problem & Context */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isMed
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      PRIORITAS {item.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    />
                    {item.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Analisis Masalah:</strong> {item.problemStatement}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-md">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Kondisi Aktual:
                      </span>
                      <span className="font-bold text-slate-900">{item.actualValue}</span>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-md">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Target / Benchmark:
                      </span>
                      <span className="font-bold text-slate-700">{item.benchmarkValue}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Recommendations */}
                <div className="lg:w-96 bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-alfamidi-red" />
                    Rekomendasi Tindakan Operasional:
                  </h3>
                  <ul className="space-y-1.5">
                    {item.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-alfamidi-red shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
