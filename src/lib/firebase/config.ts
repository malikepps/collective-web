import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration with proper error handling
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required Firebase config (in case env vars are missing)
const validateConfig = () => {
  if (!firebaseConfig.apiKey) {
    console.error('Firebase API key is missing. Check your .env.local file.');
  }
  if (!firebaseConfig.authDomain) {
    console.error('Firebase Auth Domain is missing. Check your .env.local file.');
  }
  if (!firebaseConfig.projectId) {
    console.error('Firebase Project ID is missing. Check your .env.local file.');
  }
};

validateConfig();

// Initialize Firebase with better error handling
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Fallback config to prevent app crashes, but it won't work in production
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set auth persistence to LOCAL to keep users logged in
if (typeof window !== 'undefined') {
  // Set languageCode for auth providers like phone auth
  auth.languageCode = 'en';
  
  // Log auth state for debugging
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
    } else {
      console.log('User is signed out');
    }
  });
}

// Connect to emulators in development if NEXT_PUBLIC_USE_FIREBASE_EMULATOR is set
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  if (typeof window !== 'undefined') {
    console.log('Using Firebase emulators');
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

export { app, auth, db, storage }; 