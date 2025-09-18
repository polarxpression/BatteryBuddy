// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Battery, AppSettings, DailyBatteryRecord, WeeklyBatteryAverage, MonthlyBatteryAverage } from "./types";
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
export const storage = getStorage(app);

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

export const updateAppSettings = async (settings: Partial<AppSettings>) => {
    try {
        await setDoc(settingsDoc, settings, { merge: true });
        console.log("App settings updated successfully.", settings);
    } catch (error) {
        console.error("Error updating app settings:", error);
        throw error; // Re-throw to be caught by the caller
    }
}

export const onAppSettingsSnapshot = (callback: (settings: AppSettings | null) => void) => {
    return onSnapshot(settingsDoc, snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const settings: AppSettings = {
                batteryTypes: data?.batteryTypes || {},
                packSizes: data?.packSizes || {},
                batteryBrands: data?.batteryBrands || {},
                batteryModels: data?.batteryModels || {},
                lowStockThreshold: data?.lowStockThreshold || 5,
            };
            callback(settings);
        } else {
            callback(null);
        }
    });
};

const dailyBatteryRecordsCollection = collection(db, "dailyBatteryRecords");

export const saveDailyBatteryRecord = async (batteries: Battery[]) => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const recordRef = doc(dailyBatteryRecordsCollection, dateString);

  const recordData = {
    date: dateString,
    batteries: batteries.map(battery => ({
      id: battery.id,
      brand: battery.brand,
      model: battery.model,
      type: battery.type,
      quantity: battery.quantity,
      packSize: battery.packSize,
    })),
  };

  await setDoc(recordRef, recordData);
};

export const getDailyBatteryRecords = async (): Promise<DailyBatteryRecord[]> => {
  const snapshot = await getDocs(dailyBatteryRecordsCollection);
  return snapshot.docs.map(doc => doc.data() as DailyBatteryRecord);
};

const weeklyBatteryAveragesCollection = collection(db, "weeklyBatteryAverages");
const monthlyBatteryAveragesCollection = collection(db, "monthlyBatteryAverages");

export const calculateAndSaveWeeklyAverage = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Saturday - 6
  if (dayOfWeek !== 0) return; // Only run on Sundays

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const dailyRecords = await getDocs(dailyBatteryRecordsCollection);
  const recordsInLastWeek = dailyRecords.docs
    .map(doc => doc.data() as DailyBatteryRecord)
    .filter(record => new Date(record.date) >= oneWeekAgo);

  const batteryQuantities: { [key: string]: { total: number; count: number } } = {};

  recordsInLastWeek.forEach(record => {
    record.batteries.forEach(battery => {
      const key = `${battery.brand}-${battery.model}-${battery.type}`;
      if (!batteryQuantities[key]) {
        batteryQuantities[key] = { total: 0, count: 0 };
      }
      batteryQuantities[key].total += battery.quantity;
      batteryQuantities[key].count += 1;
    });
  });

  const averages = Object.entries(batteryQuantities).map(([key, data]) => {
    const [brand, model, type] = key.split("-");
    return {
      brand,
      model,
      type,
      averageQuantity: data.total / data.count,
    };
  });

  const weekStartDate = new Date(oneWeekAgo).toISOString().split('T')[0];
  const weekEndDate = new Date(today).toISOString().split('T')[0];
  const weeklyAverageRef = doc(weeklyBatteryAveragesCollection, `${weekStartDate}_${weekEndDate}`);

  await setDoc(weeklyAverageRef, {
    weekStartDate,
    weekEndDate,
    averages,
  });
};

export const calculateAndSaveMonthlyAverage = async () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  if (dayOfMonth !== 1) return; // Only run on the 1st of the month

  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const weeklyAverages = await getDocs(weeklyBatteryAveragesCollection);
  const averagesInLastMonth = weeklyAverages.docs
    .map(doc => doc.data() as WeeklyBatteryAverage)
    .filter(average => new Date(average.weekStartDate) >= oneMonthAgo);

  const batteryQuantities: { [key: string]: { total: number; count: number } } = {};

  averagesInLastMonth.forEach(week => {
    week.averages.forEach(battery => {
      const key = `${battery.brand}-${battery.model}-${battery.type}`;
      if (!batteryQuantities[key]) {
        batteryQuantities[key] = { total: 0, count: 0 };
      }
      batteryQuantities[key].total += battery.averageQuantity;
      batteryQuantities[key].count += 1;
    });
  });

  const averages = Object.entries(batteryQuantities).map(([key, data]) => {
    const [brand, model, type] = key.split("-");
    return {
      brand,
      model,
      type,
      averageQuantity: data.total / data.count,
    };
  });

  const monthString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  const monthlyAverageRef = doc(monthlyBatteryAveragesCollection, monthString);

  await setDoc(monthlyAverageRef, {
    month: monthString,
    year: today.getFullYear(),
    averages,
  });
};

export const getWeeklyBatteryAverages = async (): Promise<WeeklyBatteryAverage[]> => {
  const snapshot = await getDocs(weeklyBatteryAveragesCollection);
  return snapshot.docs.map(doc => doc.data() as WeeklyBatteryAverage);
};

export const getMonthlyBatteryAverages = async (): Promise<MonthlyBatteryAverage[]> => {
  const snapshot = await getDocs(monthlyBatteryAveragesCollection);
  return snapshot.docs.map(doc => doc.data() as MonthlyBatteryAverage);
};
