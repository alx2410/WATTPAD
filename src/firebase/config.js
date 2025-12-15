// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_2xLTbF3dO3NPoGKEzYLIxFgxZMp_7-w",
  authDomain: "fir-ximena-ded0a.firebaseapp.com",
  projectId: "fir-ximena-ded0a",
  storageBucket: "fir-ximena-ded0a.firebasestorage.app",
  messagingSenderId: "482020343287",
  appId: "1:482020343287:web:e994e3a7771515836982f2",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);  
export const googleProvider = new GoogleAuthProvider();