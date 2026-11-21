import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ShieldAlert, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const DataMgmtPasswordModal: React.FC = () => {
  const { isDataMgmtModalOpen, setIsDataMgmtModalOpen, unlockDataMgmt, setActiveTab } = useDashboard();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDataMgmtModalOpen) {
      setPassword('');
      setError(null);
      setIsSuccess(false);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isDataMgmtModalOpen]);

  if (!isDataMgmtModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Silakan masukkan password terlebih dahulu.');
      return;
    }

    const success = unlockDataMgmt(password);
    if (success) {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        setIsDataMgmtModalOpen(false);
        setActiveTab('datamgmt');
      }, 500);
    } else {
      setError('Password salah! Akses ke Data Management ditolak.');
      setIsSuccess(false);
      inputRef.current?.select();
    }
  };

  const handleClose = () => {
    setIsDataMgmtModalOpen(false);
    setError(null);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D71920] to-[#b3141a] text-white p-5 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white inline-block">
                Area Terproteksi
              </span>
              <h2 className="text-lg font-bold text-white mt-1 leading-tight">
                Verifikasi Keamanan
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-800">
              Akses Khusus Data Management & Ingestion
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Modul ini berisi fungsi krusial: upload file Excel monitoring, update dataset sistem, dan ekspor. Masukkan password otorisasi untuk membuka akses.
            </p>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password Otorisasi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Masukkan password..."
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                    : isSuccess
                    ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                    : 'border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#D71920] focus:ring-[#D71920]/20 text-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Password benar! Membuka Data Management...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-5 py-2.5 rounded-xl bg-[#D71920] hover:bg-[#b3141a] active:bg-[#960f14] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka Akses</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
