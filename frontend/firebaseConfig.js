// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1-Ll860pacapq2_zAMF8vGPiZ6uzQLSA",
  authDomain: "wisal-b2d89.firebaseapp.com",
  projectId: "wisal-b2d89",
  storageBucket: "wisal-b2d89.firebasestorage.app",
  messagingSenderId: "710093652955",
  appId: "1:710093652955:web:30262aa1abab76dddd5dfe",
  measurementId: "G-0MLGXN15MW",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

//  أهم شي: نصدّر auth + db
export const auth = getAuth(app);
export const db = getFirestore(app);
