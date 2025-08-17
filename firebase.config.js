// firebase-config.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these values with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBAFQtuqjFeJmr2sAfBQ4TN4qojLfrXjOg",
  authDomain: "my-chat-app-project-careerfoun.firebaseapp.com",
  projectId: "my-chat-app-project-careerfoun",
  storageBucket: "my-chat-app-project-careerfoun.appspot.com",
  messagingSenderId: "781458415749",
  appId: "1:781458415749:web:405fe94458d23ddc0889ec"
};

let app;
let auth;
let db;

// ✅ Make sure we only initialize once
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  // Initialize Auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  // Initialize Firestore
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
