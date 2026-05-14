import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBx0Jr-BOXB1_Ahdbr2XS17YWYBhDLmi-0",
  authDomain: "samrtadvertsdashbord.firebaseapp.com",
  projectId: "samrtadvertsdashbord",
  storageBucket: "samrtadvertsdashbord.firebasestorage.app",
  messagingSenderId: "300701527222",
  appId: "1:300701527222:web:97483a2d72fe9565d1ca17",
  measurementId: "G-SBL2R7B4NV"
};

// Initialize Firebase securely (prevents re-initialization error in Next.js fast refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Singleton for Firestore
let db: any;
try {
  db = getFirestore(app);
} catch (e) {
  // If getFirestore fails, try initializeFirestore
  db = initializeFirestore(app, {
    // experimentalForceLongPolling: true 
  });
}

export { app, db };
