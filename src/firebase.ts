import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyArQaxLDvpf2bqbR2WoQt1L0iYRLjzd_uM",
  authDomain: "gym001-50a97.firebaseapp.com",
  projectId: "gym001-50a97",
  storageBucket: "gym001-50a97.firebasestorage.app",
  messagingSenderId: "472731970744",
  appId: "1:472731970744:web:4378f96d486e15cd41d84d",
  measurementId: "G-LXT3FWS21Y"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics safely if supported in browser
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics ignored if blocked or unsupported
  });
}

export default app;
