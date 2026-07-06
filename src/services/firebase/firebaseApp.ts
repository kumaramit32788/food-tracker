import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig, isFirebaseConfigured } from '@/constants/firebase.ts';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add credentials to .env');
  }

  if (!app) {
    app = initializeApp(getFirebaseConfig());
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();

    if (typeof window !== 'undefined') {
      try {
        auth = initializeAuth(firebaseApp, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence],
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      } catch {
        auth = getAuth(firebaseApp);
      }
    } else {
      auth = getAuth(firebaseApp);
    }
  }

  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}
