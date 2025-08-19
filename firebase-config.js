import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBAFQtuqjFeJmr2sAfBQ4TN4qojLfrXjOg",
  authDomain: "my-chat-app-project-careerfoun.firebaseapp.com",
  projectId: "my-chat-app-project-careerfoun",
  storageBucket: "my-chat-app-project-careerfoun.appspot.com",
  messagingSenderId: "781458415749",
  appId: "1:781458415749:web:405fe94458d23ddc0889ec"
};

let app, auth, db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    useFetchStreams: false
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
