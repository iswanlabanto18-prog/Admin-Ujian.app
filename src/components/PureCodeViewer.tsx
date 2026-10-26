import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileCode, 
  HelpCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const PURE_HTML_RAW_CODE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Ujian - Panel Guru & Generator QR ID Ujian</title>
  
  <!-- Font Google: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <!-- Library QR Code: qrcode.js via CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

  <!-- Firebase App & Firestore SDK (Compat v10 via CDN) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>

  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --danger: #ef4444;
      --radius: 14px;
      --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 24px 16px; }
    .container { width: 100%; max-width: 900px; }
    header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 24px; border-radius: var(--radius); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    header h1 { font-size: 1.4rem; font-weight: 800; }
    header p { font-size: 0.85rem; opacity: 0.9; }
    .status-badge { background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
    .grid-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; }
    @media (max-width: 820px) { .grid-layout { grid-template-columns: 1fr; } }
    .card { background: var(--card-bg); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); padding: 24px; }
    .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }
    label { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px; }
    input, select { width: 100%; padding: 10px 12px; font-size: 0.9rem; border: 1.5px solid var(--border); border-radius: 8px; outline: none; }
    input:focus, select:focus { border-color: var(--primary); }
    .input-pin { font-family: 'JetBrains Mono', monospace; font-size: 1rem; letter-spacing: 0.1em; font-weight: 700; }
    .help-text { font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 12px; font-size: 0.9rem; font-weight: 700; border-radius: 10px; cursor: pointer; border: none; }
    .btn-primary { background: var(--primary); color: white; margin-top: 8px; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: #f1f5f9; color: var(--text-main); margin-top: 8px; border: 1px solid var(--border); }
    .result-container { display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; min-height: 360px; }
    .qr-frame { background: white; padding: 14px; border-radius: 12px; border: 2px dashed #cbd5e1; display: inline-block; margin: 14px 0; }
    .doc-id-box { background: #f8fafc; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px; margin: 10px 0 14px; width: 100%; }
    .doc-id-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
    .doc-id-val { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Admin Ujian (Panel Guru)</h1>
        <p>Input data ujian &amp; otomatis buat QR Code unik untuk siswa</p>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span id="status-text">Siap Digunakan</span>
      </div>
    </header>

    <div class="grid-layout">
      <!-- Form Input Data Ujian -->
      <section class="card">
        <div class="card-title">Form Input Data Ujian</div>
        <form id="form-ujian" onsubmit="handleSimpanUjian(event)">
          <div class="form-group">
            <label>Nama Ujian *</label>
            <input type="text" id="nama_ujian" required placeholder="Contoh: Penilaian Akhir Semester (PAS) Matematika X">
          </div>
          <div class="form-group">
            <label>Link Google Form *</label>
            <input type="url" id="link_gform" required placeholder="https://docs.google.com/forms/d/e/.../viewform">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>PIN Masuk *</label>
              <input type="text" id="pin_masuk" class="input-pin" required maxlength="10" placeholder="123456">
            </div>
            <div class="form-group">
              <label>PIN Keluar *</label>
              <input type="text" id="pin_keluar" class="input-pin" required maxlength="10" placeholder="654321">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>PIN Pengawas *</label>
              <input type="text" id="pin_pengawas" class="input-pin" required maxlength="10" placeholder="998877">
            </div>
            <div class="form-group">
              <label>Zona Waktu *</label>
              <select id="zona_waktu" required>
                <option value="WIB" selected>WIB (UTC+7)</option>
                <option value="WITA">WITA (UTC+8)</option>
                <option value="WIT">WIT (UTC+9)</option>
              </select>
            </div>
          </div>
          <button type="submit" id="btn-simpan" class="btn btn-primary">Simpan Ujian</button>
        </form>
      </section>

      <!-- QR Code ID Ujian -->
      <section class="card">
        <div class="card-title">QR Code ID Ujian</div>
        <div class="result-container">
          <div id="placeholder-box" style="color: #64748b; padding: 20px;">
            <p><strong>Belum ada ujian disimpan</strong></p>
            <p style="font-size: 0.8rem; margin-top: 4px;">Isi form di kiri lalu klik <em>Simpan Ujian</em>.</p>
          </div>
          <div id="active-result-box" style="display: none; width: 100%;">
            <div id="res-exam-name" style="font-weight: 700; font-size: 0.95rem;">-</div>
            <div class="qr-frame"><div id="qrcode"></div></div>
            <div class="doc-id-box">
              <div class="doc-id-label">ID Ujian (Firestore)</div>
              <div class="doc-id-val" id="res-doc-id">...</div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="salinIdUjian()">Salin ID Ujian</button>
          </div>
        </div>
      </section>
    </div>
  </div>

  <script>
    // =================================================================
    // MASUKKAN FIREBASE CONFIG DI SINI
    // =================================================================
    const firebaseConfig = {
      apiKey: "MASUKKAN_API_KEY_ANDA",
      authDomain: "PROJECT_ID_ANDA.firebaseapp.com",
      projectId: "PROJECT_ID_ANDA",
      storageBucket: "PROJECT_ID_ANDA.appspot.com",
      messagingSenderId: "SENDER_ID_ANDA",
      appId: "APP_ID_ANDA"
    };
    // =================================================================

    let db = null;
    let qrGenerator = null;

    try {
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "MASUKKAN_API_KEY_ANDA") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        document.getElementById('status-text').innerText = 'Firestore Terhubung';
      } else {
        document.getElementById('status-text').innerText = 'Mode Simulasi (Belum ada API Key)';
      }
    } catch (err) {
      console.warn("Firebase config belum disetel:", err);
    }

    async function handleSimpanUjian(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-simpan');
      btn.innerText = 'Menyimpan...';
      btn.disabled = true;

      const payload = {
        nama_ujian: document.getElementById('nama_ujian').value.trim(),
        link_gform: document.getElementById('link_gform').value.trim(),
        pin_masuk: document.getElementById('pin_masuk').value.trim(),
        pin_keluar: document.getElementById('pin_keluar').value.trim(),
        pin_pengawas: document.getElementById('pin_pengawas').value.trim(),
        zona_waktu: document.getElementById('zona_waktu').value,
        created_at: (typeof firebase !== 'undefined' && firebase.firestore) 
          ? firebase.firestore.FieldValue.serverTimestamp() 
          : new Date().toISOString()
      };

      let docId = '';
      try {
        if (db) {
          // Menyimpan ke koleksi 'data_ujian'
          const docRef = await db.collection('data_ujian').add(payload);
          docId = docRef.id;
        } else {
          docId = 'demo_' + Math.random().toString(36).substring(2, 9);
        }

        // Tampilkan hasil dan render QR Code HANYA memuat ID Ujian
        document.getElementById('placeholder-box').style.display = 'none';
        document.getElementById('active-result-box').style.display = 'block';
        document.getElementById('res-exam-name').innerText = payload.nama_ujian;
        document.getElementById('res-doc-id').innerText = docId;

        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';
        qrGenerator = new QRCode(qrContainer, {
          text: docId, // HANYA BERISI ID DOKUMEN FIRESTORE
          width: 180,
          height: 180,
          correctLevel: QRCode.CorrectLevel.H
        });

      } catch (err) {
        alert("Gagal simpan ke Firestore: " + err.message);
      } finally {
        btn.innerText = 'Simpan Ujian';
        btn.disabled = false;
      }
    }

    function salinIdUjian() {
      const id = document.getElementById('res-doc-id').innerText;
      navigator.clipboard.writeText(id).then(() => alert("ID Ujian disalin: " + id));
    }
  </script>
</body>
</html>`;

export const PureCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PURE_HTML_RAW_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([PURE_HTML_RAW_CODE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_ujian.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileCode className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Kode Lengkap HTML, CSS, &amp; JavaScript Murni (Single File)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sesuai permintaan Anda: 1 file mandiri tanpa node/npm, menggunakan qrcode.js CDN &amp; Firestore SDK, serta placeholder <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">// MASUKKAN FIREBASE CONFIG DI SINI</code>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{showPreview ? 'Sembunyikan Pratinjau' : 'Buka Pratinjau Langsung'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Kode Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Seluruh Kode</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh admin_ujian.html</span>
          </button>
        </div>
      </div>

      {/* Guide Card */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs text-slate-700">
        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Cara Menjalankan File HTML Murni Ini:</span>
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
          <li>
            Klik tombol <strong>"Unduh admin_ujian.html"</strong> di atas atau salin kode ke text editor (Notepad, VS Code, dll).
          </li>
          <li>
            Buka file tersebut di browser (cukup klik ganda file <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">admin_ujian.html</code>).
          </li>
          <li>
            Cari baris komentar <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-700">// MASUKKAN FIREBASE CONFIG DI SINI</code> dan gantikan dengan kredensial Firebase Anda dari Firebase Console.
          </li>
          <li>
            Pastikan di <strong>Firestore Rules</strong> Firebase Console Anda telah mengizinkan penulisan pada koleksi <code className="font-mono text-blue-700 font-bold">data_ujian</code>.
          </li>
        </ol>
      </div>

      {/* Live Preview Iframe (if toggled) */}
      {showPreview && (
        <div className="mb-6 p-4 rounded-2xl border-2 border-indigo-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pratinjau Langsung Pure HTML/CSS/JS di Browser</span>
            </span>
            <span className="text-[11px] text-slate-500">Iframe Mandiri</span>
          </div>
          <iframe
            src="/admin_ujian_murni.html"
            title="Pratinjau Pure HTML"
            className="w-full h-[600px] bg-white rounded-xl border border-slate-200 shadow-inner"
          />
        </div>
      )}

      {/* Code Display */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="font-mono text-slate-300 ml-2">admin_ujian.html</span>
          </div>
          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
            HTML + CSS + Vanilla JS + qrcode.js
          </span>
        </div>

        <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed max-h-[500px]">
          <code>{PURE_HTML_RAW_CODE}</code>
        </pre>
      </div>

    </div>
  );
};
