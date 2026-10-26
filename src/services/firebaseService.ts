import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  Firestore,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ExamData, FirebaseConfigState } from '../types/exam';

const STORAGE_KEY_CONFIG = 'guru_admin_firebase_config';
const STORAGE_KEY_LOCAL_EXAMS = 'guru_admin_local_exams';

// Default config template
export const DEFAULT_CONFIG_PLACEHOLDER: FirebaseConfigState = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

export function getStoredFirebaseConfig(): FirebaseConfigState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read config from localStorage', e);
  }
  return DEFAULT_CONFIG_PLACEHOLDER;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigState): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

let activeApp: FirebaseApp | null = null;
let activeDb: Firestore | null = null;

export function initializeFirebase(config: FirebaseConfigState): { success: boolean; error?: string } {
  if (!config.apiKey || !config.projectId) {
    activeApp = null;
    activeDb = null;
    return { success: false, error: 'Kunci API atau Project ID Firebase belum diisi' };
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      activeApp = getApp();
    } else {
      activeApp = initializeApp(config);
    }
    activeDb = getFirestore(activeApp);
    return { success: true };
  } catch (err: any) {
    console.error('Inisialisasi Firebase gagal:', err);
    return { success: false, error: err.message || 'Gagal inisialisasi Firebase' };
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getStoredFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.apiKey.length > 10);
}

// Simpan data ujian ke koleksi 'data_ujian' di Firestore
export async function saveExamToFirestore(
  data: Omit<ExamData, 'id' | 'createdAt'>
): Promise<{ id: string; isRealFirestore: boolean }> {
  const config = getStoredFirebaseConfig();
  const isReady = isFirebaseConfigured();

  if (isReady) {
    try {
      if (!activeDb) {
        initializeFirebase(config);
      }

      if (activeDb) {
        // Simpan ke koleksi 'data_ujian' sesuai permintaan
        const docRef = await addDoc(collection(activeDb, 'data_ujian'), {
          namaUjian: data.namaUjian,
          linkGoogleForm: data.linkGoogleForm,
          pinMasuk: data.pinMasuk,
          pinKeluar: data.pinKeluar,
          pinPengawas: data.pinPengawas,
          zonaWaktu: data.zonaWaktu,
          createdAt: serverTimestamp()
        });

        const newExam: ExamData = {
          ...data,
          id: docRef.id,
          createdAt: new Date().toISOString()
        };
        saveLocalExamBackup(newExam);

        return { id: docRef.id, isRealFirestore: true };
      }
    } catch (error: any) {
      console.warn('Gagal simpan ke Firestore langsung, beralih ke mode simulasi:', error);
      // fallback jika permission denied atau offline
    }
  }

  // Fallback mode simulasi jika Firebase belum diatur
  await new Promise((r) => setTimeout(r, 600));
  const pseudoId = 'ujn_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
  const newExam: ExamData = {
    ...data,
    id: pseudoId,
    createdAt: new Date().toISOString()
  };
  saveLocalExamBackup(newExam);

  return { id: pseudoId, isRealFirestore: false };
}

// Backup / Local Storage management
export function getLocalExams(): ExamData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_EXAMS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read exams from localStorage', e);
  }
  return [
    {
      id: 'demo_pas_mat_x_2026',
      namaUjian: 'Penilaian Akhir Semester (PAS) Matematika Kelas X',
      linkGoogleForm: 'https://docs.google.com/forms/d/e/1FAIpQLSc-example/viewform',
      pinMasuk: '482910',
      pinKeluar: '739182',
      pinPengawas: '991122',
      zonaWaktu: 'WIB',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];
}

export function saveLocalExamBackup(exam: ExamData): void {
  const current = getLocalExams().filter((item) => item.id !== exam.id);
  current.unshift(exam);
  localStorage.setItem(STORAGE_KEY_LOCAL_EXAMS, JSON.stringify(current));
}

export async function fetchExamsFromFirestore(): Promise<ExamData[]> {
  const config = getStoredFirebaseConfig();
  if (isFirebaseConfigured()) {
    try {
      if (!activeDb) {
        initializeFirebase(config);
      }
      if (activeDb) {
        const q = query(collection(activeDb, 'data_ujian'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const list: ExamData[] = [];
        snapshot.forEach((d) => {
          const docData = d.data();
          list.push({
            id: d.id,
            namaUjian: docData.namaUjian || docData.nama_ujian || 'Tanpa Nama',
            linkGoogleForm: docData.linkGoogleForm || docData.link_gform || '',
            pinMasuk: docData.pinMasuk || docData.pin_masuk || '',
            pinKeluar: docData.pinKeluar || docData.pin_keluar || '',
            pinPengawas: docData.pinPengawas || docData.pin_pengawas || '',
            zonaWaktu: docData.zonaWaktu || docData.zona_waktu || 'WIB',
            createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
          });
        });
        if (list.length > 0) return list;
      }
    } catch (err) {
      console.warn('Gagal ambil data_ujian dari Firestore:', err);
    }
  }
  return getLocalExams();
}

export async function deleteExam(id: string): Promise<void> {
  if (isFirebaseConfigured() && activeDb) {
    try {
      await deleteDoc(doc(activeDb, 'data_ujian', id));
    } catch (e) {
      console.warn('Gagal hapus doc di Firestore:', e);
    }
  }
  const current = getLocalExams().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY_LOCAL_EXAMS, JSON.stringify(current));
}
