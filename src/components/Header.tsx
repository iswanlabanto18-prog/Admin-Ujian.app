import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  QrCode, 
  Database, 
  Code2, 
  Settings, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebaseService';

interface HeaderProps {
  activeTab: 'form' | 'list' | 'code';
  setActiveTab: (tab: 'form' | 'list' | 'code') => void;
  onOpenSettings: () => void;
  examCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  examCount
}) => {
  const [timeWIB, setTimeWIB] = useState('');
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());

    const updateClock = () => {
      const now = new Date();
      // Format time in WIB (UTC+7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setTimeWIB(new Intl.DateTimeFormat('id-ID', options).format(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Admin Ujian Guru</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  Firestore Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pengelolaan Google Form, PIN Pengawas, &amp; Generator QR ID Ujian
              </p>
            </div>
          </div>

          {/* Right Action Bar: Time, Status, & Settings */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Live Clock WIB */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>WIB: <strong className="font-mono text-white">{timeWIB || '--:--:--'}</strong></span>
            </div>

            {/* Firebase Status Badge */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                firebaseActive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/60'
              }`}
              title="Klik untuk konfigurasi Firebase"
            >
              {firebaseActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Firestore: Terhubung</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Simulasi (Atur Config)</span>
                </>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Pengaturan Firebase Config"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-800/80 pt-2 -mb-px overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'form'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Form Input &amp; Buat QR</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Koleksi data_ujian</span>
            {examCount > 0 && (
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded-full border border-slate-700">
                {examCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'code'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kode HTML Murni (Pure HTML/JS)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
              Standalone
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
