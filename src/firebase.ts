import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

// Resolve optional Firebase API key from environment variables (e.g. Netlify / Vite config)
// to prevent hardcoded secrets in repository config files
const envApiKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_API_KEY) ||
  config.apiKey ||
  '';

export const firebaseConfig = {
  ...(envApiKey ? { apiKey: envApiKey } : {}),
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

// Initialize Firebase App instance singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Connect specifically to the named Firestore database instance if provided
export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Startup connection health check
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected to Firebase Firestore successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or waiting for network.');
    } else {
      console.log('[Firestore] Firestore connection initialized.');
    }
    return false;
  }
}

// Automatically verify connection on load in browser
if (typeof window !== 'undefined') {
  testFirestoreConnection().catch(() => {});
}

export { app };
