import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDz0h4abiMep9Jd3rDW6fvAq_M7RtENi4g",
    authDomain: "amigo-secreto-66dfc.firebaseapp.com",
    projectId: "amigo-secreto-66dfc",
    storageBucket: "amigo-secreto-66dfc.firebasestorage.app",
    messagingSenderId: "611225557600",
    appId: "1:611225557600:web:a12a2527b7a00664ea0105"
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);