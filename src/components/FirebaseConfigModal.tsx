import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Database, 
  Check, 
  AlertCircle, 
  Copy, 
  HelpCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { FirebaseConfigState } from '../types/exam';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  initializeFirebase,
  DEFAULT_CONFIG_PLACEHOLDER
} from '../services/firebaseService';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<FirebaseConfigState>(getStoredFirebaseConfig());
  const [rawSnippet, setRawSnippet] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  // Helper parse raw JS snippet if user pasted snippet directly
  const handleParseSnippet = () => {
    try {
      const apiKeyMatch = rawSnippet.match(/apiKey:\s*["']([^"']+)["']/);
      const projectIdMatch = rawSnippet.match(/projectId:\s*["']([^"']+)["']/);
      const authDomainMatch = rawSnippet.match(/authDomain:\s*["']([^"']+)["']/);
      const storageBucketMatch = rawSnippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const senderIdMatch = rawSnippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = rawSnippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch && projectIdMatch) {
        const parsed: FirebaseConfigState = {
          apiKey: apiKeyMatch[1],
          projectId: projectIdMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : `${projectIdMatch[1]}.firebaseapp.com`,
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : `${projectIdMatch[1]}.appspot.com`,
          messagingSenderId: senderIdMatch ? senderIdMatch[1] : '',
          appId: appIdMatch ? appIdMatch[1] : ''
        };
        setConfig(parsed);
        setStatusMessage({ type: 'success', text: 'Berhasil mengekstrak Firebase Config dari teks!' });
        return;
      }

      // Try JSON.parse
      const cleanJson = rawSnippet.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const parsed = JSON.parse(cleanJson);
      if (parsed.apiKey && parsed.projectId) {
        setConfig({
          apiKey: parsed.apiKey,
          projectId: parsed.projectId,
          authDomain: parsed.authDomain || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || ''
        });
        setStatusMessage({ type: 'success', text: 'Berhasil membaca JSON Firebase Config!' });
        return;
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Format teks belum sesuai. Silakan isi form di bawah secara manual.' });
    }
  };

  const handleSave = () => {
    saveStoredFirebaseConfig(config);
    const result = initializeFirebase(config);
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Firebase Firestore berhasil dihubungkan!' });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 1000);
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Gagal menghubungkan Firebase.' });
    }
  };

  const handleResetToDemo = () => {
    saveStoredFirebaseConfig(DEFAULT_CONFIG_PLACEHOLDER);
    setConfig(DEFAULT_CONFIG_PLACEHOLDER);
    setStatusMessage({ type: 'success', text: 'Beralih ke mode simulasi (kunci API dikosongkan).' });
    setTimeout(() => {
      onConfigSaved();
      onClose();
    }, 1000);
  };

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data_ujian/{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSample);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pengaturan Firebase Firestore</h3>
              <p className="text-xs text-slate-500">Koneksikan database Firestore proyek Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Quick Paste Snippet Area */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tempel Cuplikan <code className="text-blue-600 font-mono">firebaseConfig</code> dari Console
            </label>
            <textarea
              rows={3}
              placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "ujian-sekolah-123",\n  ...\n};'}
              value={rawSnippet}
              onChange={(e) => setRawSnippet(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleParseSnippet}
                disabled={!rawSnippet.trim()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Ekstrak Nilai Otomatis
              </button>
            </div>
          </div>

          {/* Individual Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: sman1-ujian-online"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  placeholder="sman1-ujian.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={config.messagingSenderId}
                  onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  placeholder="1:1234567890:web:abcdef..."
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Firestore Security Rules Helper */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Aturan Firestore (Security Rules):</span>
              </span>
              <button
                type="button"
                onClick={handleCopyRules}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? 'Tersalin' : 'Salin Rules'}</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800/90 mb-2">
              Pastikan di tab <strong>Firestore Database &gt; Rules</strong> pada Firebase Console Anda mengizinkan penulisan:
            </p>
            <pre className="p-2 bg-amber-100/70 rounded font-mono text-[11px] overflow-x-auto text-amber-950">
              {firestoreRulesSample}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Gunakan Mode Simulasi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              Simpan &amp; Hubungkan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
