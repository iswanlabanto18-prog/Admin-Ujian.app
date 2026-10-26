/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ExamForm } from './components/ExamForm';
import { QrResultCard } from './components/QrResultCard';
import { ExamList } from './components/ExamList';
import { PureCodeViewer } from './components/PureCodeViewer';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { PrintExamSheet } from './components/PrintExamSheet';
import { ExamData } from './types/exam';
import { 
  saveExamToFirestore, 
  fetchExamsFromFirestore, 
  deleteExam,
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  initializeFirebase
} from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'code'>('form');
  const [exams, setExams] = useState<ExamData[]>([]);
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealFirestore, setIsRealFirestore] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [examToPrint, setExamToPrint] = useState<ExamData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Initial load
  useEffect(() => {
    const config = getStoredFirebaseConfig();
    if (config.apiKey && config.projectId) {
      initializeFirebase(config);
    }
    loadExamsList();
  }, []);

  const loadExamsList = async () => {
    const list = await fetchExamsFromFirestore();
    setExams(list);
    if (list.length > 0 && !activeExam) {
      setActiveExam(list[0]);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveExam = async (formData: Omit<ExamData, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const result = await saveExamToFirestore(formData);
      setIsRealFirestore(result.isRealFirestore);

      const savedExam: ExamData = {
        ...formData,
        id: result.id,
        createdAt: new Date().toISOString()
      };

      setActiveExam(savedExam);
      setExams((prev) => [savedExam, ...prev.filter((e) => e.id !== savedExam.id)]);

      // Confetti celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore confetti if not supported
      }

      showToast(
        result.isRealFirestore 
          ? `Ujian berhasil disimpan di Firestore (ID: ${result.id})!` 
          : `ID Ujian (${result.id}) berhasil dibuat! QR Code siap digunakan.`
      );

      // On mobile, scroll to result
      window.scrollTo({ top: 400, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Error saving exam:', err);
      showToast('Gagal menyimpan ujian: ' + (err.message || 'Terjadi kesalahan'), 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    await deleteExam(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
    if (activeExam?.id === id) {
      setActiveExam(exams.find((e) => e.id !== id) || null);
    }
    showToast('Data ujian telah dihapus dari koleksi.');
  };

  const handleSelectExamFromList = (exam: ExamData) => {
    setActiveExam(exam);
    setActiveTab('form');
    showToast(`Membuka QR Code untuk ${exam.namaUjian}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        examCount={exams.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tab 1: Form Input & Generator QR */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form (7 Cols on large screen) */}
            <div className="lg:col-span-7">
              <ExamForm onSave={handleSaveExam} isLoading={isLoading} />
            </div>

            {/* Right Column: QR Code Result (5 Cols on large screen) */}
            <div className="lg:col-span-5 sticky top-24">
              <QrResultCard
                exam={activeExam}
                isRealFirestore={isRealFirestore}
                onPrintPreview={(ex) => setExamToPrint(ex)}
              />
            </div>

          </div>
        )}

        {/* Tab 2: Koleksi data_ujian */}
        {activeTab === 'list' && (
          <ExamList
            exams={exams}
            onSelectExam={handleSelectExamFromList}
            onDeleteExam={handleDeleteExam}
            onPrintExam={(ex) => setExamToPrint(ex)}
            onGoToCreate={() => setActiveTab('form')}
          />
        )}

        {/* Tab 3: Pure HTML/JS Code Viewer */}
        {activeTab === 'code' && (
          <PureCodeViewer />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Admin Ujian Guru</strong> • Firestore Collection: <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">data_ujian</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              Pengaturan Firebase
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('code')}
              className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              Kode HTML Murni
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <FirebaseConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          loadExamsList();
          setIsRealFirestore(isFirebaseConfigured());
          showToast('Konfigurasi Firebase diperbarui!');
        }}
      />

      {/* Print Exam Sheet Modal */}
      {examToPrint && (
        <PrintExamSheet
          exam={examToPrint}
          onClose={() => setExamToPrint(null)}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification.message}</span>
        </div>
      )}

    </div>
  );
}
