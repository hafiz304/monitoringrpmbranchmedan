import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { parseExcelWorkbook, EXPECTED_SHEETS } from '../utils/excelParser';
import { exportDashboardPDF, exportCleanedExcel } from '../utils/exportUtils';
import { formatNumber, formatRupiah } from '../utils/formatters';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
  Database,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  Lock,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const DataManagement: React.FC = () => {
  const { data, updateData, isDataMgmtUnlocked, unlockDataMgmt, lockDataMgmt } = useDashboard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagePassword, setPagePassword] = useState('');
  const [showPagePassword, setShowPagePassword] = useState(false);
  const [pagePasswordError, setPagePasswordError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
    details?: string[];
  } | null>(null);
  const [previewStats, setPreviewStats] = useState<{
    sheetCount: number;
    storesCount: number;
    productsCount: number;
    filename: string;
  } | null>(null);

  const handleUnlockPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagePassword.trim()) {
      setPagePasswordError('Silakan masukkan password terlebih dahulu.');
      return;
    }
    const ok = unlockDataMgmt(pagePassword);
    if (!ok) {
      setPagePasswordError('Password salah! Akses ke Data Management ditolak.');
    } else {
      setPagePasswordError(null);
      setPagePassword('');
    }
  };

  // If locked, render security gate
  if (!isDataMgmtUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-[#D71920] to-[#b3141a] text-white p-6 text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-inner flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white inline-block mb-1">
              Area Terproteksi
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Data Management Terkunci
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Diperlukan kata sandi otorisasi untuk mengakses fitur pengelolaan data RPM
            </p>
          </div>

          <form onSubmit={handleUnlockPage} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Masukkan Password Otorisasi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPagePassword ? 'text' : 'password'}
                  value={pagePassword}
                  onChange={(e) => {
                    setPagePassword(e.target.value);
                    if (pagePasswordError) setPagePasswordError(null);
                  }}
                  placeholder="Password..."
                  autoFocus
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    pagePasswordError
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#D71920] focus:ring-[#D71920]/20 text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPagePassword(!showPagePassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPagePassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPagePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pagePasswordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{pagePasswordError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#D71920] hover:bg-[#b3141a] active:bg-[#960f14] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Buka Akses Data Management</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadMessage(null);

    try {
      const result = await parseExcelWorkbook(file);

      if (!result.success || !result.data) {
        setUploadMessage({
          type: 'error',
          text: 'Gagal memproses file Excel. Pastikan file memiliki sheet yang sesuai format RPM Alfamidi.',
          details: result.warnings,
        });
        setIsProcessing(false);
        return;
      }

      setPreviewStats({
        sheetCount: result.sheetStatus.filter((s) => s.found).length,
        storesCount: result.data.stores.length,
        productsCount: result.data.products.length,
        filename: file.name,
      });

      // Update data state
      updateData(result.data);

      setUploadMessage({
        type: result.warnings.length > 0 ? 'warning' : 'success',
        text: `Berhasil mengimpor dan memperbarui data dari "${file.name}"! Seluruh dashboard sekarang menggunakan dataset terbaru.`,
        details: result.warnings.length > 0 ? result.warnings : undefined,
      });
    } catch (err: any) {
      setUploadMessage({
        type: 'error',
        text: `Terjadi kesalahan teknis saat membaca file: ${err.message || 'Error tidak diketahui'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Lock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Data Management & Excel File Ingestion
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Akses Terotorisasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola file sumber Excel, unggah dataset monitoring periode berikutnya, validasi kelengkapan sheet, dan ekspor laporan
          </p>
        </div>

        <button
          onClick={lockDataMgmt}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Kunci kembali Data Management"
        >
          <Lock className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
          <span>Kunci Akses</span>
        </button>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-alfamidi-red" />
          Unggah File Excel Monitoring RPM (.xlsx / .xls)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Sistem akan secara dinamis membaca, memetakan, memvalidasi 18 sheet operasional, dan menghitung ulang seluruh KPI di dashboard secara instan.
        </p>

        <div className="border-2 border-dashed border-slate-200 hover:border-alfamidi-red rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-red-50/20 transition-all relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-alfamidi-red flex items-center justify-center">
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isProcessing ? 'Sedang Membaca & Memproses Data...' : 'Klik atau Tarik File Excel ke Sini'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Format yang didukung: .xlsx, .xls • Contoh: "11 Monitoring RPM 02 - 08 NOV 2026.xlsx"
              </p>
            </div>
          </div>
        </div>

        {/* Upload Status Banner */}
        {uploadMessage && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : uploadMessage.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2">
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : uploadMessage.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{uploadMessage.text}</p>
                {uploadMessage.details && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                    {uploadMessage.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export & Download Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Download Original File */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-alfamidi-red flex items-center justify-center mb-3">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Download File Asli Excel</h3>
            <p className="text-xs text-slate-500 mt-1">
              Unduh salinan asli file data primer: <em>11 Monitoring RPM 02 - 08 NOV 2026.xlsx</em> (3.2 MB).
            </p>
          </div>
          <a
            href="/11 Monitoring RPM 02 - 08 NOV 2026.xlsx"
            download="11 Monitoring RPM 02 - 08 NOV 2026.xlsx"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-alfamidi-red hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File Excel Sumber</span>
          </a>
        </div>

        {/* Export Cleaned Excel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Export Laporan Excel Bersih</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hasil ekstraksi tabel RESUME, daftar 267 toko, dan master produk dalam format XLSX terstruktur rapi.
            </p>
          </div>
          <button
            onClick={() => exportCleanedExcel(data)}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Data XLSX Bersih</span>
          </button>
        </div>

        {/* Export Executive PDF */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Export Laporan PDF Eksekutif</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dokumen PDF siap cetak dengan branding resmi Alfamidi: Executive Summary, KPI, Brand Ranking, dan AM Matrix.
            </p>
          </div>
          <button
            onClick={() => exportDashboardPDF(data)}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate &amp; Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Sheet Verification Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-alfamidi-red" />
              Daftar Lembar Kerja yang Dikenali ({[...EXPECTED_SHEETS, ...(data.meta.brands || []).map(b => `AC-AM ${b}`), ...(data.meta.brands || [])].length} Sheet Standar RPM)
            </h2>
            <p className="text-xs text-slate-500">
              Setiap sheet brand dan operasional dipetakan secara dinamis berdasarkan data Excel yang diunggah
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {[...EXPECTED_SHEETS, ...(data.meta.brands || []).map(b => `AC-AM ${b}`), ...(data.meta.brands || [])].length} Sheet Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[...EXPECTED_SHEETS, ...(data.meta.brands || []).map(b => `AC-AM ${b}`), ...(data.meta.brands || [])].map((sname) => (
            <div
              key={sname}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center gap-2 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700 truncate" title={sname}>
                {sname}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Dataset Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          Metadata Dataset Aktif
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Periode RPM:</span>
            <span className="font-bold text-slate-900">{data.meta.period.replace('MONITORING RPM PERIODE ', '')}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Time Factor:</span>
            <span className="font-bold text-slate-900">{(data.meta.time_factor * 100).toFixed(2)}% (Hari {data.meta.hari_ke}/7)</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Toko:</span>
            <span className="font-bold text-slate-900">{data.meta.total_stores} Toko</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total PLU Aktif:</span>
            <span className="font-bold text-slate-900">{data.meta.total_products} PLU</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tgl Stok:</span>
            <span className="font-bold text-slate-900">{data.meta.stock_date}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Periode Sales:</span>
            <span className="font-bold text-slate-900">{data.meta.sales_period}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
