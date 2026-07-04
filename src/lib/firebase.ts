import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpJREh2nHWH-KprEaDG98GpGVEnXtzWkQ",
  authDomain: "gen-lang-client-0091534955.firebaseapp.com",
  projectId: "gen-lang-client-0091534955",
  storageBucket: "gen-lang-client-0091534955.firebasestorage.app",
  messagingSenderId: "946768894452",
  appId: "1:946768894452:web:517fab8602cfc7c13e81a1",
  measurementId: "G-NT5YLRSPCG"
};

const app = initializeApp(firebaseConfig);

// Note: Critical to use the custom databaseId provided in firebase-applet-config.json
const db = initializeFirestore(app, {}, "ai-studio-4d8006f4-4972-407b-9088-899b0755b65b");

export { db };
