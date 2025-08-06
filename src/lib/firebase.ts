// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { Battery } from "./types";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMKc42PJ5_Iztm6zruI3QND6uv2t5ZaEg",
  authDomain: "batterybuddy-3fe86.firebaseapp.com",
  projectId: "batterybuddy-3fe86",
  storageBucket: "batterybuddy-3fe86.firebasestorage.app",
  messagingSenderId: "577036011593",
  appId: "1:577036011593:web:4afab6b249ead3923e1798",
  measurementId: "G-EQJW5BPCW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try {
  getAnalytics(app);
} catch (error) {
  console.log(error)
}
export const db = getFirestore(app);

const batteriesCollection = collection(db, "batteries");

export const getBatteries = async (): Promise<Battery[]> => {
    const snapshot = await getDocs(batteriesCollection);
    return snapshot.docs.map(doc => doc.data() as Battery);
}

export const addBattery = async (battery: Battery) => {
    const batteryRef = doc(batteriesCollection, battery.id);
    await setDoc(batteryRef, battery);
}

export const updateBattery = async (battery: Battery) => {
    const batteryRef = doc(batteriesCollection, battery.id);
    await setDoc(batteryRef, battery, { merge: true });
}

export const deleteBattery = async (id: string) => {
    const batteryRef = doc(batteriesCollection, id);
    await deleteDoc(batteryRef);
}

export const onBatteriesSnapshot = (callback: (batteries: Battery[]) => void) => {
  return onSnapshot(batteriesCollection, snapshot => {
    const batteries = snapshot.docs.map(doc => doc.data() as Battery);
    callback(batteries);
  });
};
