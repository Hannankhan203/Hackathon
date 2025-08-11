import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, Timestamp, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcEm1ROIfbFK7Tz38caecMfs_vLqPA-EY",
  authDomain: "dashboard-application-82519.firebaseapp.com",
  projectId: "dashboard-application-82519",
  storageBucket: "dashboard-application-82519.firebasestorage.app",
  messagingSenderId: "231688655016",
  appId: "1:231688655016:web:b3409edb1378315991729d",
  measurementId: "G-9FHPK809QT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
}