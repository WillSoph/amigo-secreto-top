import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUUmGCCAbM4W4qjsHzHGmr0-DuoenvjF4",
  authDomain: "amigo-secreto-7e4a2.firebaseapp.com",
  projectId: "amigo-secreto-7e4a2",
  storageBucket: "amigo-secreto-7e4a2.firebasestorage.app",
  messagingSenderId: "153613873221",
  appId: "1:153613873221:web:e1b3d6c05e390a6a21f32c",
  measurementId: "G-B8KL2BLCQB"
};

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);