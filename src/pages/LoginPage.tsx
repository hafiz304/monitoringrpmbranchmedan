import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithName } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Silakan ketik nama Anda terlebih dahulu.');
      return;
    }
    setError(null);
    loginWithName(name.trim());
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Floating Modern Rounded Modal Card */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-slate-300/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left Side: Minimalist Alfamidi RPM Branding (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#D71920] via-[#C1121F] to-[#005BAA] p-6 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Decorative Circles */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-600/30 blur-2xl pointer-events-none" />

          {/* Top Logo & Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-2xl text-[#D71920] shadow-md">
                M
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">
                  alfa<span className="text-yellow-300">midi</span>
                </span>
                <span className="text-[10px] block font-bold text-white/80 -mt-1 tracking-wider uppercase">
                  PT Midi Utama Indonesia Tbk
                </span>
              </div>
            </div>

            <div className="mt-6 lg:mt-14">
              <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                RPM Monitoring Dashboard
              </h1>
              <p className="text-xs text-white/80 mt-2 font-medium">
                Sistem Pemantauan Rekomendasi Produk Mingguan
              </p>
            </div>
          </div>

          {/* Clean Footer Info */}
          <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/70 mt-6 lg:mt-0">
            <span>Branch: Alfamidi Branch Medan</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Sistem Internal</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form with Name Input Only (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div className="my-auto">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Selamat Datang
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Silakan masukkan nama Anda untuk melanjutkan ke dashboard.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Form: Name Input Only */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Anda
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ketik nama Anda di sini..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D71920]/20 focus:border-[#D71920] transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#D71920] to-[#005BAA] hover:opacity-95 shadow-md shadow-red-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Simple Bottom Legal */}
          <div className="pt-6 text-[10px] text-slate-400 text-center border-t border-slate-100">
            &copy; 2026 PT Midi Utama Indonesia Tbk • Alfamidi Branch Medan
          </div>
        </div>
      </div>
    </div>
  );
};
