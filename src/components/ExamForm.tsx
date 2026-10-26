import React, { useState } from 'react';
import { 
  Send, 
  Dices, 
  ExternalLink, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  KeyRound, 
  Clock, 
  FileEdit,
  Globe
} from 'lucide-react';
import { ExamData, TimeZone } from '../types/exam';

interface ExamFormProps {
  onSave: (data: Omit<ExamData, 'id' | 'createdAt'>) => Promise<void>;
  isLoading: boolean;
}

export const ExamForm: React.FC<ExamFormProps> = ({ onSave, isLoading }) => {
  const [namaUjian, setNamaUjian] = useState('');
  const [linkGoogleForm, setLinkGoogleForm] = useState('');
  const [pinMasuk, setPinMasuk] = useState('');
  const [pinKeluar, setPinKeluar] = useState('');
  const [pinPengawas, setPinPengawas] = useState('');
  const [zonaWaktu, setZonaWaktu] = useState<TimeZone>('WIB');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper generator 6-digit random PIN
  const generateRandomPin = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRandomizeAllPins = () => {
    setPinMasuk(generateRandomPin());
    setPinKeluar(generateRandomPin());
    setPinPengawas(generateRandomPin());
  };

  const handleQuickPreset = (presetName: string) => {
    setNamaUjian(presetName);
    if (!linkGoogleForm) {
      setLinkGoogleForm('https://docs.google.com/forms/d/e/1FAIpQLSc-contoh-link-gform-ujian/viewform');
    }
    if (!pinMasuk) setPinMasuk(generateRandomPin());
    if (!pinKeluar) setPinKeluar(generateRandomPin());
    if (!pinPengawas) setPinPengawas(generateRandomPin());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaUjian.trim()) {
      setErrorMsg('Nama ujian wajib diisi.');
      return;
    }

    if (!linkGoogleForm.trim()) {
      setErrorMsg('Link Google Form wajib diisi.');
      return;
    }

    try {
      new URL(linkGoogleForm);
    } catch {
      setErrorMsg('Format Link Google Form tidak valid. Pastikan diawali dengan http:// atau https://');
      return;
    }

    if (!pinMasuk.trim() || !pinKeluar.trim() || !pinPengawas.trim()) {
      setErrorMsg('Semua PIN (Masuk, Keluar, dan Pengawas) wajib diisi.');
      return;
    }

    await onSave({
      namaUjian: namaUjian.trim(),
      linkGoogleForm: linkGoogleForm.trim(),
      pinMasuk: pinMasuk.trim(),
      pinKeluar: pinKeluar.trim(),
      pinPengawas: pinPengawas.trim(),
      zonaWaktu
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileEdit className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Formulir Data Ujian</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data akan disimpan ke koleksi <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">data_ujian</code> di Firestore
          </p>
        </div>

        {/* Quick Fill Button */}
        <button
          type="button"
          onClick={() => handleQuickPreset('Penilaian Akhir Semester (PAS) Matematika Kelas X')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Isi Contoh Otomatis</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Nama Ujian */}
        <div>
          <label htmlFor="namaUjian" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nama Ujian <span className="text-rose-500">*</span>
          </label>
          <input
            id="namaUjian"
            type="text"
            required
            value={namaUjian}
            onChange={(e) => setNamaUjian(e.target.value)}
            placeholder="Contoh: Penilaian Akhir Semester (PAS) Matematika Kelas X"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder:text-slate-400"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 py-0.5">Preset Cepat:</span>
            {['PAS Ganjil', 'PTS Genap', 'Asesmen Sumatif', 'Try Out'].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setNamaUjian((prev) => prev ? `${prev} - ${preset}` : preset)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md cursor-pointer transition"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Link Google Form */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="linkGoogleForm" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Link Google Form Ujian <span className="text-rose-500">*</span>
            </label>
            {linkGoogleForm.startsWith('http') && (
              <a
                href={linkGoogleForm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>Uji Buka Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="relative">
            <input
              id="linkGoogleForm"
              type="url"
              required
              value={linkGoogleForm}
              onChange={(e) => setLinkGoogleForm(e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/.../viewform"
              className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-2.5 text-slate-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gunakan tautan viewform Google Form yang sudah siap dikerjakan siswa.
          </p>
        </div>

        {/* Action button to randomize all PINs */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Pengaturan Keamanan &amp; PIN</span>
          </div>
          <button
            type="button"
            onClick={handleRandomizeAllPins}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Acak Semua PIN</span>
          </button>
        </div>

        {/* PIN Inputs Grid (Masuk & Keluar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 3. PIN Masuk */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pinMasuk" className="text-xs font-semibold text-slate-700">
                PIN Masuk <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPinMasuk(generateRandomPin())}
                className="text-[10px] text-slate-500 hover:text-blue-600 font-medium"
              >
                Acak PIN
              </button>
            </div>
            <input
              id="pinMasuk"
              type="text"
              required
              maxLength={12}
              value={pinMasuk}
              onChange={(e) => setPinMasuk(e.target.value)}
              placeholder="Contoh: 492018"
              className="w-full px-3.5 py-2 text-sm font-mono tracking-wider font-semibold rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400">Dimasukkan siswa untuk memulai soal</span>
          </div>

          {/* 4. PIN Keluar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pinKeluar" className="text-xs font-semibold text-slate-700">
                PIN Keluar <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPinKeluar(generateRandomPin())}
                className="text-[10px] text-slate-500 hover:text-blue-600 font-medium"
              >
                Acak PIN
              </button>
            </div>
            <input
              id="pinKeluar"
              type="text"
              required
              maxLength={12}
              value={pinKeluar}
              onChange={(e) => setPinKeluar(e.target.value)}
              placeholder="Contoh: 819203"
              className="w-full px-3.5 py-2 text-sm font-mono tracking-wider font-semibold rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400">Dimasukkan siswa saat selesai kirim jawaban</span>
          </div>

        </div>

        {/* PIN Pengawas & Zona Waktu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 5. PIN Pengawas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pinPengawas" className="text-xs font-semibold text-slate-700">
                PIN Pengawas / Guru <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPinPengawas(generateRandomPin())}
                className="text-[10px] text-slate-500 hover:text-blue-600 font-medium"
              >
                Acak PIN
              </button>
            </div>
            <input
              id="pinPengawas"
              type="text"
              required
              maxLength={12}
              value={pinPengawas}
              onChange={(e) => setPinPengawas(e.target.value)}
              placeholder="Contoh: 991100"
              className="w-full px-3.5 py-2 text-sm font-mono tracking-wider font-semibold rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400">PIN darurat / reset oleh pengawas ruang</span>
          </div>

          {/* 6. Dropdown Zona Waktu (WIB, WITA, WIT) */}
          <div>
            <label htmlFor="zonaWaktu" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Zona Waktu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="zonaWaktu"
                value={zonaWaktu}
                onChange={(e) => setZonaWaktu(e.target.value as TimeZone)}
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 bg-white"
              >
                <option value="WIB">WIB - Waktu Indonesia Barat (UTC+7)</option>
                <option value="WITA">WITA - Waktu Indonesia Tengah (UTC+8)</option>
                <option value="WIT">WIT - Waktu Indonesia Timur (UTC+9)</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-400">Sinkronisasi jam buka/tutup ujian di perangkat siswa</span>
          </div>

        </div>

        {/* Tombol Simpan Ujian */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan ke Firestore...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Simpan Ujian &amp; Buat QR Code</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
