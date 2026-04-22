import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2YKO_n5MVZpTntDkiir-wKZQiepxg8bw",
  authDomain: "bread-and-butter-b8b7b.firebaseapp.com",
  projectId: "bread-and-butter-b8b7b",
  storageBucket: "bread-and-butter-b8b7b.firebasestorage.app",
  messagingSenderId: "354067619644",
  appId: "1:354067619644:web:b890bf2d9551529097c839",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
