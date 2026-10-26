import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Shield, Clock, Key } from 'lucide-react';
import { ExamData } from '../types/exam';

interface PrintExamSheetProps {
  exam: ExamData | null;
  onClose: () => void;
}

export const PrintExamSheet: React.FC<PrintExamSheetProps> = ({ exam, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!exam || !exam.id || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      exam.id,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      },
      (error) => {
        if (error) console.error('Gagal cetak QR:', error);
      }
    );
  }, [exam]);

  if (!exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Floating Screen Action Bar (hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pratinjau Lembar Cetak Ujian</h3>
            <p className="text-xs text-slate-500">Siap dicetak pada kertas A4 untuk ditempel di ruang ujian</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CARD CONTENT (Clean, High Contrast Black/White for standard printers) */}
        <div className="border-4 border-slate-900 p-6 sm:p-8 rounded-2xl text-center bg-white text-slate-900">
          
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-600 block mb-1">
              KARTU AKSES UJIAN SISWA • {exam.zonaWaktu}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {exam.namaUjian}
            </h1>
          </div>

          {/* QR Code Container */}
          <div className="my-4 inline-block p-4 border-2 border-slate-900 rounded-2xl bg-white shadow-sm">
            <canvas ref={canvasRef} className="mx-auto" />
            <div className="text-[11px] font-bold text-slate-800 tracking-wider uppercase mt-2">
              SCAN QR CODE INI
            </div>
          </div>

          {/* Document ID */}
          <div className="max-w-md mx-auto my-4 p-3 bg-slate-100 border border-slate-300 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
              ID Ujian (Firestore)
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-slate-950 tracking-wider">
              {exam.id}
            </span>
          </div>

          {/* Student & Proctor Credentials */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-6 text-left">
            <div className="p-3 border-2 border-slate-900 rounded-xl bg-white">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">
                PIN MASUK (SISWA)
              </span>
              <span className="font-mono text-2xl font-black text-slate-950 tracking-widest">
                {exam.pinMasuk}
              </span>
            </div>

            <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">
                PIN KELUAR (SELESAI)
              </span>
              <span className="font-mono text-xl font-bold text-slate-800 tracking-widest">
                {exam.pinKeluar}
              </span>
            </div>
          </div>

          {/* Proctor Note */}
          <div className="border-t border-slate-200 pt-4 mt-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PIN Pengawas Ruangan: <strong className="font-mono text-slate-900">{exam.pinPengawas}</strong></span>
            <span>Zona Waktu: <strong className="text-slate-900">{exam.zonaWaktu}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
