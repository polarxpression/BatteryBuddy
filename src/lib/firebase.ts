// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { Battery, AppSettings } from "./types";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

(async () => {
  if (await isSupported()) {
    getAnalytics(app);
  }
})();
export const db = getFirestore(app);

const batteriesCollection = collection(db, "batteries");
const settingsDoc = doc(db, "settings", "app-settings");

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

export const getAppSettings = async (): Promise<AppSettings | null> => {
    const snapshot = await getDoc(settingsDoc);
    return snapshot.exists() ? snapshot.data() as AppSettings : null;
}

export const updateAppSettings = async (settings: AppSettings) => {
    await setDoc(settingsDoc, settings, { merge: true });
}

export const onAppSettingsSnapshot = (callback: (settings: AppSettings | null) => void) => {
    return onSnapshot(settingsDoc, snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const settings: AppSettings = {
                batteryTypes: data?.batteryTypes || [],
                packSizes: data?.packSizes || [],
                batteryBrands: data?.batteryBrands || [],
                batteryModels: data?.batteryModels || [],
                lowStockThreshold: data?.lowStockThreshold || 5,
            };
            callback(settings);
        } else {
            callback(null);
        }
    });
};
