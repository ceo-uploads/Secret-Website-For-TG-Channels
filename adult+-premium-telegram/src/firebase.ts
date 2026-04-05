import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbbtetihOcLs26aZjpXrX4nQ6wSMwCexY",
  authDomain: "adult-plus-telegram.firebaseapp.com",
  projectId: "adult-plus-telegram",
  storageBucket: "adult-plus-telegram.firebasestorage.app",
  messagingSenderId: "723434112226",
  appId: "1:723434112226:web:b049e766957a2e1070cabb",
  measurementId: "G-VJR3C3ED94",
  databaseURL: "https://adult-plus-telegram-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
