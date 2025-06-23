import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL4su5ItCLVJHQ1y4gq9NHV17vVh46ADk",
  authDomain: "camilla-og-frederiks-app.firebaseapp.com",
  databaseURL:
    "https://camilla-og-frederiks-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "camilla-og-frederiks-app",
  storageBucket: "camilla-og-frederiks-app.firebasestorage.app",
  messagingSenderId: "808301550029",
  appId: "1:808301550029:web:c788f1a9861490931d0c84",
  measurementId: "G-EHLSWSLJDD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
