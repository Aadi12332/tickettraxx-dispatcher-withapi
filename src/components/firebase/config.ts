import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Fallback to hardcoded values when import.meta.env is not available.
// These values come from your provided .env and are safe to use locally.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAuPsal3jBDYFA8UL8kNUAAMJo2KbjKsP4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "tickettraxx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "tickettraxx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "tickettraxx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "274545438298",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:274545438298:web:9ba9518988134d66b3263",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-G2V7DTBMCQ",
};

// Prevent "Firebase App named '[DEFAULT]' already exists" errors during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

export default app;