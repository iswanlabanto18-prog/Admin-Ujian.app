export type TimeZone = 'WIB' | 'WITA' | 'WIT';

export interface ExamData {
  id?: string;
  namaUjian: string;
  linkGoogleForm: string;
  pinMasuk: string;
  pinKeluar: string;
  pinPengawas: string;
  zonaWaktu: TimeZone;
  createdAt?: any;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
