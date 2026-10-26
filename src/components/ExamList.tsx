import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  QrCode, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock,
  Printer
} from 'lucide-react';
import { ExamData, TimeZone } from '../types/exam';

interface ExamListProps {
  exams: ExamData[];
  onSelectExam: (exam: ExamData) => void;
  onDeleteExam: (id: string) => void;
  onPrintExam: (exam: ExamData) => void;
  onGoToCreate: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  onSelectExam,
  onDeleteExam,
  onPrintExam,
  onGoToCreate
}) => {
  const [search, setSearch] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPinsMap, setShowPinsMap] = useState<Record<string, boolean>>({});

  const filteredExams = exams.filter((exam) => {
    const matchName = exam.namaUjian.toLowerCase().includes(search.toLowerCase()) ||
                      (exam.id && exam.id.toLowerCase().includes(search.toLowerCase()));
    const matchZone = filterZone === 'all' || exam.zonaWaktu === filterZone;
    return matchName && matchZone;
  });

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePinVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPinsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Koleksi Dokumen <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-sm">data_ujian</code>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {exams.length} data ujian tersimpan di database Firestore
          </p>
        </div>

        {/* Search & Zone Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari ujian / ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none w-full sm:w-56"
            />
          </div>

          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
          >
            <option value="all">Semua Zona Waktu</option>
            <option value="WIB">WIB (UTC+7)</option>
            <option value="WITA">WITA (UTC+8)</option>
            <option value="WIT">WIT (UTC+9)</option>
          </select>
        </div>
      </div>

      {/* List or Empty State */}
      {filteredExams.length === 0 ? (
        <div className="py-14 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data ujian ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {search || filterZone !== 'all'
              ? 'Coba ganti kata kunci pencarian atau filter zona waktu Anda.'
              : 'Belum ada ujian yang disimpan. Buat ujian baru untuk mulai menghasilkan QR Code.'}
          </p>
          <button
            onClick={onGoToCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            <span>+ Buat Ujian Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => {
            const isPinsVisible = showPinsMap[exam.id || ''] || false;
            return (
              <div
                key={exam.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {exam.zonaWaktu}
                    </span>
                    {exam.createdAt && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(exam.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {exam.namaUjian}
                  </h3>

                  {/* Document ID */}
                  <div className="my-2 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="overflow-hidden mr-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Document ID
                      </span>
                      <span className="font-mono text-xs font-bold text-blue-600 truncate block">
                        {exam.id}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleCopyId(exam.id || '', e)}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition"
                      title="Salin ID Ujian"
                    >
                      {copiedId === exam.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Google Form Link */}
                  <a
                    href={exam.linkGoogleForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mb-3 truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{exam.linkGoogleForm}</span>
                  </a>

                  {/* PINs row */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Kredensial PIN
                      </span>
                      <button
                        onClick={(e) => togglePinVisibility(exam.id || '', e)}
                        className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        {isPinsVisible ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Tampilkan</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-semibold">Masuk</span>
                        <span className="font-mono font-bold text-slate-800">
                          {isPinsVisible ? exam.pinMasuk : '••••••'}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-semibold">Keluar</span>
                        <span className="font-mono font-bold text-slate-800">
                          {isPinsVisible ? exam.pinKeluar : '••••••'}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-semibold">Pengawas</span>
                        <span className="font-mono font-bold text-slate-800">
                          {isPinsVisible ? exam.pinPengawas : '••••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectExam(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Buka QR</span>
                  </button>

                  <button
                    onClick={() => onPrintExam(exam)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    title="Cetak Kartu Ujian"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (exam.id && confirm(`Hapus data ujian "${exam.namaUjian}" dari koleksi data_ujian?`)) {
                        onDeleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                    title="Hapus Ujian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
