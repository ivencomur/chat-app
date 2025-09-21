import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { initializeAuth, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Import persistence only for React Native (not web)
let getReactNativePersistence = null;
let AsyncStorage = null;

if (Platform.OS !== 'web') {
  try {
    // Only import these for mobile platforms
    const authModule = require('firebase/auth');
    getReactNativePersistence = authModule.getReactNativePersistence;
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.log('React Native persistence not available for web - using browser persistence');
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

let app, auth, db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Platform-specific auth initialization
  if (Platform.OS === 'web') {
    // Web: Use browser persistence (default)
    auth = getAuth(app);
    console.log('🌐 Web: Using browser persistence for auth');
  } else {
    // Mobile: Use React Native persistence with AsyncStorage
    if (getReactNativePersistence && AsyncStorage) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('📱 Mobile: Using AsyncStorage persistence for auth');
    } else {
      // Fallback for mobile
      auth = getAuth(app);
      console.log('📱 Mobile: Using default persistence for auth');
    }
  }
  
  // Firestore initialization (same for all platforms)
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    useFetchStreams: false
  });
  
  console.log(`🔥 Firebase initialized for ${Platform.OS}`);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  console.log(`🔄 Firebase reused for ${Platform.OS}`);
}

export { app, auth, db };
