import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Check, 
  Copy, 
  Download, 
  Printer, 
  QrCode as QrIcon, 
  Share2, 
  ShieldCheck, 
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ExamData } from '../types/exam';

interface QrResultCardProps {
  exam: ExamData | null;
  isRealFirestore?: boolean;
  onPrintPreview: (exam: ExamData) => void;
}

export const QrResultCard: React.FC<QrResultCardProps> = ({
  exam,
  isRealFirestore = false,
  onPrintPreview
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!exam || !exam.id) return;

    // Persyaratan ketat user: "QR Code tersebut HANYA berisi teks 'ID Ujian' dari Firestore"
    const textToEncode = exam.id;

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        textToEncode,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) console.error('Gagal generate QR Code canvas:', error);
        }
      );
    }

    QRCode.toDataURL(
      textToEncode,
      {
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H'
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [exam]);

  const handleCopyId = () => {
    if (!exam?.id) return;
    navigator.clipboard.writeText(exam.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !exam) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const cleanName = exam.namaUjian.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `QR_ID_UJIAN_${cleanName}_${exam.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopySummary = () => {
    if (!exam || !exam.id) return;
    const text = `📋 *INFORMASI SESI UJIAN*
*Nama Ujian:* ${exam.namaUjian}
*ID Ujian (Firestore):* \`${exam.id}\`
*Zona Waktu:* ${exam.zonaWaktu}

🔑 *KREDENSIAL PIN:*
- PIN Masuk (Siswa): *${exam.pinMasuk}*
- PIN Keluar (Selesai): *${exam.pinKeluar}*
- PIN Pengawas: *${exam.pinPengawas}*

🔗 *Link Soal (Google Form):*
${exam.linkGoogleForm}

_Scan QR Code ID Ujian pada layar pengawas untuk masuk otomatis._`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  if (!exam) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
          <QrIcon className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">QR Code Belum Dibuat</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Silakan isi formulir di sebelah kiri dan klik tombol <span className="font-semibold text-slate-700">"Simpan Ujian"</span>. QR Code unik ID Ujian dari Firestore akan otomatis tampil di sini.
        </p>
        <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>QR Code hanya akan memuat string ID Dokumen Firestore</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-md shadow-blue-500/5 p-6 sm:p-7 relative overflow-hidden">
      
      {/* Top Banner Status */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {isRealFirestore ? 'Tersimpan di Firestore' : 'ID Ujian Dihasilkan'}
          </span>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {exam.zonaWaktu}
        </span>
      </div>

      {/* Exam Title */}
      <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug mb-1">
        {exam.namaUjian}
      </h3>
      <p className="text-xs text-slate-500 mb-5 line-clamp-1">
        {exam.linkGoogleForm}
      </p>

      {/* QR Code Canvas Frame */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
          <canvas ref={canvasRef} className="block rounded-lg" />
        </div>

        {/* Verification Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>QR Code <strong>HANYA</strong> berisi teks ID Ujian</span>
        </div>
      </div>

      {/* Document ID Box */}
      <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Document ID (ID Ujian Firestore)
          </span>
          <button
            onClick={handleCopyId}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin ID</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-sm sm:text-base font-bold text-blue-700 break-all select-all">
          {exam.id}
        </div>
      </div>

      {/* Quick Summary of PINs */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">PIN Masuk</span>
          <span className="font-mono text-xs font-bold text-slate-900">{exam.pinMasuk}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">PIN Keluar</span>
          <span className="font-mono text-xs font-bold text-slate-900">{exam.pinKeluar}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Pengawas</span>
          <span className="font-mono text-xs font-bold text-slate-900">{exam.pinPengawas}</span>
        </div>
      </div>

      {/* Action Buttons: Download, Print, Share */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
        <button
          onClick={handleDownloadQr}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          title="Unduh QR Code format PNG beresolusi tinggi"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh QR</span>
        </button>

        <button
          onClick={() => onPrintPreview(exam)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
          title="Cetak lembar ujian untuk dipajang di papan tulis atau meja peserta"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Kartu</span>
        </button>

        <button
          onClick={handleCopySummary}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          title="Salin format pengumuman ke grup WhatsApp guru/pengawas"
        >
          {copiedSummary ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Format WA</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
