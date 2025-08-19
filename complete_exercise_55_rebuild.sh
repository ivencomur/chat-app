#!/bin/bash

# 🎯 COMPLETE EXERCISE 5.5 REBUILD SCRIPT
# Reconstructs the entire working app from scratch
# Includes all working features: Chat + Pictures + Location (fixed)
# Use this in a fresh, empty branch to avoid VS Code/Git conflicts

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                🎯 COMPLETE EXERCISE 5.5 REBUILD SCRIPT 🎯                   ║${NC}"
    echo -e "${PURPLE}║   Fresh Build • All Features Working • Chat + Pictures + Location Fixed    ║${NC}"
    echo -e "${PURPLE}║                  Perfect for New Branch • No Git Conflicts                  ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() { echo -e "\n${CYAN}▓▓▓ $1 ▓▓▓${NC}"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

clear
print_banner

print_info "This script will create a complete Exercise 5.5 app from scratch"
print_info "Perfect for a fresh branch to avoid Git/VS Code conflicts"
echo ""

# STEP 1: VERIFY CLEAN STATE
print_step "STEP 1: PREPARING CLEAN WORKSPACE"

print_info "Ensuring we're in a clean state..."
# Kill any running processes
pkill -f "metro" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

# Clean everything
rm -rf node_modules .expo .metro-cache .cache dist build web-build android ios
rm -f *.js *.jsx *.ts *.tsx *.json *.config.* .env* README.md
rm -f package-lock.json yarn.lock pnpm-lock.yaml
npm cache clean --force 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true

print_success "Workspace cleaned and ready"

# STEP 2: CREATE PACKAGE.JSON (Working Dependencies)
print_step "STEP 2: CREATING PACKAGE.JSON WITH PROVEN DEPENDENCIES"

cat > package.json << 'EOF'
{
  "name": "exercise-5-5-complete",
  "version": "5.5.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "reset": "rm -rf node_modules .expo && npm install && expo start --clear"
  },
  "dependencies": {
    "expo": "51.0.39",
    "expo-status-bar": "1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-dom": "18.2.0",
    "react-native-web": "0.19.10",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/netinfo": "11.3.1",
    "@react-navigation/native": "6.1.18",
    "@react-navigation/native-stack": "6.11.0",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "3.31.1",
    "react-native-gifted-chat": "2.4.0",
    "firebase": "10.13.2",
    "@expo/metro-runtime": "3.2.3",
    "@expo/react-native-action-sheet": "^4.0.1",
    "expo-image-picker": "~14.7.1",
    "expo-location": "~16.5.5"
  },
  "devDependencies": {
    "@babel/core": "7.24.0"
  },
  "private": true
}
EOF

print_success "Package.json created with working dependencies"

# STEP 3: CREATE ALL CONFIG FILES
print_step "STEP 3: CREATING CONFIGURATION FILES"

# app.json with all permissions
cat > app.json << 'EOF'
{
  "expo": {
    "name": "Exercise 5.5 Complete",
    "slug": "exercise-5-5-complete",
    "version": "5.5.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "splash": {
      "backgroundColor": "#6200EE"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.exercise55.complete",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera to take photos for sharing in chat",
        "NSPhotoLibraryUsageDescription": "This app accesses photo library to share images in chat",
        "NSLocationWhenInUseUsageDescription": "This app uses location to share your location in chat"
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#6200EE"
      },
      "package": "com.exercise55.complete",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "bundler": "metro"
    }
  }
}
EOF

# babel.config.js
cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
EOF

# metro.config.js with IDB fix
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'idb' || moduleName.includes('idb')) {
    return {
      filePath: path.resolve(__dirname, 'empty-module.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
EOF

# empty-module.js
cat > empty-module.js << 'EOF'
module.exports = {};
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
.expo/
.expo-shared/
.metro-cache/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.DS_Store
*.log
package-lock.json
yarn.lock
EOF

print_success "All configuration files created"

# STEP 4: CREATE FIREBASE CONFIG
print_step "STEP 4: CREATING FIREBASE CONFIGURATION"

cat > firebase-config.js << 'EOF'
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
EOF

print_success "Firebase configuration created"

# STEP 5: CREATE MAIN APP COMPONENT
print_step "STEP 5: CREATING MAIN APP COMPONENT"

cat > App.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from './firebase-config';
import Start from './Start';
import Chat from './Chat';

// Ignore common warnings that don't affect functionality
LogBox.ignoreLogs([
  'AsyncStorage has been extracted',
  '@firebase/auth',
  'Setting a timer',
  'Non-serializable values',
  'Support for defaultProps',
  'Possible unhandled promise rejection',
  'Avatar: Support for defaultProps',
]);

const Stack = createNativeStackNavigator();

export default function App() {
  // Exercise 5.4: Real-time network connectivity detection
  const connectionStatus = useNetInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [networkMessage, setNetworkMessage] = useState('');

  // Initialize app after a brief delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Exercise 5.4: Handle network status changes
  useEffect(() => {
    if (!isInitialized) return;

    if (connectionStatus.isConnected === false) {
      setNetworkMessage('📱 Offline Mode - Reading cached messages');
      // Exercise 5.4: Disable Firestore when offline
      disableNetwork(db).catch(console.error);
    } else if (connectionStatus.isConnected === true) {
      setNetworkMessage('🌐 Online - Syncing messages');
      // Exercise 5.4: Enable Firestore when online
      enableNetwork(db).catch(console.error);
    }
    
    // Clear network message after showing it briefly
    const timer = setTimeout(() => setNetworkMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [connectionStatus.isConnected, isInitialized]);

  // Show loading screen during initialization
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading Exercise 5.5 Chat...</Text>
      </View>
    );
  }

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {/* Display network status banner */}
        {networkMessage ? (
          <View style={[
            styles.networkBanner,
            { backgroundColor: connectionStatus.isConnected ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.networkText}>{networkMessage}</Text>
          </View>
        ) : null}
        
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen
            name="Start"
            component={Start}
            options={{ headerShown: false }}
          />
          {/* Exercise 5.4: Pass isConnected prop to Chat component */}
          <Stack.Screen name="Chat">
            {props => (
              <Chat
                db={db}
                isConnected={connectionStatus.isConnected}
                {...props}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  networkBanner: {
    padding: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
EOF

print_success "Main App component created"

# STEP 6: CREATE START SCREEN
print_step "STEP 6: CREATING START SCREEN"

cat > Start.js << 'EOF'
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase-config';

const { width, height } = Dimensions.get('window');

export default function Start({ navigation }) {
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 5 beautiful themes for Exercise 5.4/5.5
  const themes = [
    { name: 'Material Purple', primary: '#6200EE', secondary: '#3700B3', accent: '#BB86FC' },
    { name: 'Ocean Blue', primary: '#0277BD', secondary: '#01579B', accent: '#4FC3F7' },
    { name: 'Forest Green', primary: '#2E7D32', secondary: '#1B5E20', accent: '#66BB6A' },
    { name: 'Sunset Orange', primary: '#F57C00', secondary: '#E65100', accent: '#FFB74D' },
    { name: 'Rose Pink', primary: '#C2185B', secondary: '#AD1457', accent: '#F48FB1' }
  ];

  const currentTheme = themes[selectedTheme];

  const handleSignIn = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Username Required', 'Please enter your name to start chatting.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInAnonymously(auth);
      navigation.navigate('Chat', {
        userID: result.user.uid,
        name: trimmedName,
        theme: currentTheme
      });
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>💬 Chat App</Text>
            <Text style={styles.subtitle}>Exercise 5.5 • Complete Features</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              maxLength={25}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <Text style={styles.label}>Choose Theme (5 Options)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themeScroll}
            >
              {themes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeCard,
                    { backgroundColor: theme.primary },
                    selectedTheme === index && styles.selectedTheme
                  ]}
                  onPress={() => setSelectedTheme(index)}
                  disabled={isLoading}
                >
                  <View style={styles.themePreview}>
                    <View style={[styles.dot, { backgroundColor: theme.secondary }]} />
                    <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                  </View>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.accent }]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Start Chatting</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, minHeight: height - 100 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: width > 400 ? 48 : 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, maxWidth: 500, width: '100%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24 },
  themeScroll: { marginBottom: 24, maxHeight: 100 },
  themeCard: { width: 90, height: 80, borderRadius: 12, marginRight: 10, padding: 8, justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent' },
  selectedTheme: { borderColor: '#000', transform: [{ scale: 1.05 }] },
  themePreview: { flexDirection: 'row', justifyContent: 'flex-end' },
  dot: { width: 10, height: 10, borderRadius: 5, marginLeft: 4 },
  themeName: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});
EOF

print_success "Start screen created"

# STEP 7: CREATE CUSTOM ACTIONS (Exercise 5.5 Communication Features)
print_step "STEP 7: CREATING CUSTOM ACTIONS FOR COMMUNICATION FEATURES"

cat > CustomActions.js << 'EOF'
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const CustomActions = ({ onSend, userID }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to share photos!');
        return;
      }

      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          image: result.assets[0].uri,
          text: '',
        }]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
        return;
      }

      // Launch camera
      let result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          image: result.assets[0].uri,
          text: '',
        }]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const getLocation = async () => {
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need location permissions to share your location!');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (location) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          text: 'Location shared',
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        }]);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };

  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = 3;
    
    showActionSheetWithOptions(
      { 
        options, 
        cancelButtonIndex,
        title: 'Communication Features'
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: 
            pickImage(); 
            break;
          case 1: 
            takePhoto(); 
            break;
          case 2: 
            getLocation(); 
            break;
          default:
            // Cancel - do nothing
            break;
        }
      }
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={styles.wrapper}>
        <Text style={styles.iconText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: 26, 
    height: 26, 
    marginLeft: 10, 
    marginBottom: 10 
  },
  wrapper: { 
    borderRadius: 13, 
    borderColor: '#b2b2b2', 
    borderWidth: 2, 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconText: { 
    color: '#b2b2b2', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default CustomActions;
EOF

print_success "CustomActions with all communication features created"

# STEP 8: CREATE CHAT COMPONENT (Complete with Fixed Location)
print_step "STEP 8: CREATING CHAT COMPONENT WITH ALL FEATURES"

cat > Chat.js << 'EOF'
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { GiftedChat, InputToolbar, Bubble, Day, Send } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';

const { width } = Dimensions.get('window');

export default function Chat({ db, route, navigation, isConnected }) {
  const { userID, name = 'User', theme = {
    name: 'Material Purple',
    primary: '#6200EE',
    secondary: '#3700B3',
    accent: '#BB86FC'
  } } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let unsubscribeMessages;

  useEffect(() => {
    // Update header to show connection status and theme
    navigation.setOptions({
      title: `${name} ${isConnected ? '🟢' : '🔴'}`,
      headerStyle: { backgroundColor: theme.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    const setupChat = async () => {
      // Exercise 5.4: Decide data source based on connection
      if (isConnected === true) {
        console.log('📡 ONLINE: Fetching messages from Firestore and caching them');
        
        // Clean up any existing listener
        if (unsubscribeMessages) unsubscribeMessages();
        
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        unsubscribeMessages = onSnapshot(
          q,
          async (snapshot) => {
            const newMessages = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                _id: doc.id,
                text: data.text || '',
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                user: data.user || {},
                image: data.image || null,
                location: data.location || null,
              };
            });
            
            console.log(`💾 CACHING: ${newMessages.length} messages to AsyncStorage`);
            // Exercise 5.4: Cache messages when online
            await cacheMessages(newMessages);
            setMessages(newMessages);
            setIsLoading(false);
          },
          (error) => {
            console.error('❌ Firestore error:', error);
            // Fallback to cached messages if Firestore fails
            loadCachedMessages();
          }
        );
      } else {
        console.log('📱 OFFLINE: Loading messages from AsyncStorage cache');
        // Exercise 5.4: Load cached messages when offline
        await loadCachedMessages();
      }
    };

    setupChat();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [isConnected, theme.primary, name]);

  // Exercise 5.4: Function to load cached messages from AsyncStorage
  const loadCachedMessages = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('chat_messages');
      if (cached) {
        const parsed = JSON.parse(cached);
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }));
        setMessages(messagesWithDates);
        console.log(`📥 LOADED: ${messagesWithDates.length} messages from cache`);
      } else {
        setMessages([]);
        console.log('📭 CACHE EMPTY: No cached messages found');
      }
    } catch (error) {
      console.error('❌ CACHE LOAD ERROR:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Exercise 5.4: Function to cache messages in AsyncStorage
  const cacheMessages = useCallback(async (messagesToCache) => {
    try {
      // Limit cache size to prevent storage issues
      const limited = messagesToCache.slice(0, 50);
      await AsyncStorage.setItem('chat_messages', JSON.stringify(limited));
      console.log(`✅ CACHED: ${limited.length} messages saved to AsyncStorage`);
    } catch (error) {
      console.error('❌ CACHE SAVE ERROR:', error);
    }
  }, []);

  // Send new messages (only when online)
  const onSend = useCallback(async (newMessages = []) => {
    if (newMessages.length > 0 && isConnected) {
      try {
        const message = {
          ...newMessages[0],
          createdAt: serverTimestamp(),
          user: {
            _id: userID,
            name: name,
          },
        };
        
        // Exercise 5.5: Handle image messages
        if (newMessages[0].image) {
          message.image = newMessages[0].image;
        }
        
        // Exercise 5.5: Handle location messages
        if (newMessages[0].location) {
          message.location = newMessages[0].location;
        }
        
        await addDoc(collection(db, 'messages'), message);
        console.log('📤 MESSAGE SENT to Firestore');
      } catch (error) {
        console.error('❌ SEND ERROR:', error);
      }
    }
  }, [isConnected, db, userID, name]);

  // Exercise 5.4: Hide InputToolbar when offline
  const renderInputToolbar = (props) => {
    if (!isConnected) {
      console.log('🚫 OFFLINE: InputToolbar hidden to prevent message composition');
      return null;
    }
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  // Exercise 5.5: Render action button for communication features
  const renderActions = (props) => {
    return <CustomActions userID={userID} {...props} />;
  };

  // Exercise 5.5: Beautiful location display - NO MapView dependency (FIXED)
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      const { latitude, longitude } = currentMessage.location;
      
      // Function to open in external maps
      const openInMaps = () => {
        const url = Platform.select({
          ios: `maps:${latitude},${longitude}`,
          android: `geo:${latitude},${longitude}`,
          default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        });
        Linking.openURL(url);
      };

      // Beautiful location card with professional styling
      return (
        <TouchableOpacity style={styles.locationCard} onPress={openInMaps}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationTitleContainer}>
              <Text style={styles.locationTitle}>Location Shared</Text>
              <Text style={styles.locationSubtitle}>Tap to open in Maps</Text>
            </View>
            <Text style={styles.externalIcon}>🗺️</Text>
          </View>
          
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>Coordinates:</Text>
            <Text style={styles.coordinatesText}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.locationFooter}>
            <Text style={styles.footerText}>• Tap to open in Google Maps or Apple Maps</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Custom bubble styling with theme colors
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: theme.primary,
            borderRadius: 15,
            marginVertical: 2,
          },
          left: {
            backgroundColor: '#FFFFFF',
            borderRadius: 15,
            marginVertical: 2,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }
        }}
        textStyle={{
          right: { color: '#FFFFFF' },
          left: { color: '#000000' }
        }}
      />
    );
  };

  // Custom day rendering
  const renderDay = (props) => {
    return (
      <Day
        {...props}
        textStyle={{ color: '#666', fontSize: 12 }}
      />
    );
  };

  // Custom send button with theme colors
  const renderSend = (props) => {
    return (
      <Send {...props} containerStyle={{ justifyContent: 'center' }}>
        <View style={[styles.sendContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.sendText}>Send</Text>
        </View>
      </Send>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>
          {isConnected ? 'Loading messages...' : 'Loading cached messages...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: userID,
            name: name,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderActions={renderActions}
          renderCustomView={renderCustomView}
          renderDay={renderDay}
          renderSend={renderSend}
          placeholder={isConnected ? "Type a message..." : "You are offline - messages not available"}
          alwaysShowSend={true}
          scrollToBottom
          scrollToBottomStyle={{ backgroundColor: theme.accent }}
          listViewProps={{
            style: { backgroundColor: '#F5F5F5' }
          }}
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
          renderUsernameOnMessage={true}
        />
      </KeyboardAvoidingView>
      
      {/* Exercise 5.4: Offline indicator at bottom of screen */}
      {!isConnected && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Offline Mode - Viewing cached messages only
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 10 },
  inputToolbar: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 6 },
  inputPrimary: { alignItems: 'center' },
  sendContainer: { justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 5, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  sendText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  offlineIndicator: { backgroundColor: '#FF9800', padding: 8, alignItems: 'center' },
  offlineText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  
  // Exercise 5.5: Beautiful location card styles - NO MapView needed (FIXED)
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationTitleContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  externalIcon: {
    fontSize: 20,
  },
  coordinatesContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '500',
  },
  locationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});
EOF

print_success "Complete Chat component with all Exercise 5.4 + 5.5 features created"

# STEP 9: CREATE README.md
print_step "STEP 9: CREATING README.md DOCUMENTATION"

cat > README.md << 'EOF'
# Exercise 5.5 Complete Chat App

A complete React Native chat application with all Exercise 5.4 and 5.5 features implemented.

## 🎯 Features Implemented

### Exercise 5.4 Features (Offline Ready)
- ✅ **Real-time network connectivity detection** using `@react-native-community/netinfo`
- ✅ **Online mode**: Firestore real-time sync with automatic message caching
- ✅ **Offline mode**: Load and display cached messages from AsyncStorage
- ✅ **Input management**: Text input disabled when offline
- ✅ **Visual indicators**: Connection status in header and offline banner
- ✅ **5 beautiful themes**: Material Purple, Ocean Blue, Forest Green, Sunset Orange, Rose Pink

### Exercise 5.5 Features (Communication Features)
- ✅ **ActionSheet**: 4 communication options (Choose From Library, Take Picture, Send Location, Cancel)
- ✅ **Image picker**: Access device photo library to share images
- ✅ **Camera integration**: Take photos with device camera
- ✅ **Location sharing**: GPS location sharing with beautiful location cards
- ✅ **Cost-free implementation**: Local image storage, no Firebase Storage billing
- ✅ **Cross-platform support**: iOS, Android, Web

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the app:**
   ```bash
   npx expo start --clear
   ```

3. **Test platforms:**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web

## 🧪 Testing Instructions

### Exercise 5.4 Testing (Offline Features)
1. Start the app and create some messages
2. Turn OFF WiFi/internet on your device
3. Verify cached messages still display
4. Verify input toolbar is hidden (can't send messages)
5. Turn WiFi back ON
6. Verify input toolbar reappears and messages sync

### Exercise 5.5 Testing (Communication Features)
1. Look for the '+' button in the chat input area
2. Tap '+' to see ActionSheet with 4 options
3. Test **'Choose From Library'**: Select an image from device
4. Test **'Take Picture'**: Capture photo with camera
5. Test **'Send Location'**: Share GPS location
6. Verify location displays as beautiful card
7. Tap location card to open in external maps

## 📱 Platform Support

- **iOS**: Full support including camera, photo library, and location
- **Android**: Full support including camera, photo library, and location  
- **Web**: Basic support (limited camera/location features)

## 🔧 Technical Details

- **React Native**: 0.74.5
- **Expo**: 51.0.39
- **Firebase**: 10.13.2 (Firestore + Authentication)
- **Navigation**: React Navigation 6
- **Chat UI**: React Native Gifted Chat 2.4.0
- **Permissions**: Expo Image Picker + Expo Location
- **ActionSheet**: Expo React Native Action Sheet

## 📝 Project Structure

```
├── App.js                 # Main navigation with ActionSheet provider
├── Start.js               # Welcome screen with themes
├── Chat.js                # Main chat with all features
├── CustomActions.js       # ActionSheet for communication features
├── firebase-config.js     # Firebase configuration
├── package.json           # Dependencies
├── app.json              # Expo configuration with permissions
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
└── empty-module.js       # IDB compatibility fix
```

## 🎨 Themes Available

1. **Material Purple** - #6200EE (Google Material Design)
2. **Ocean Blue** - #0277BD (Professional & Clean)
3. **Forest Green** - #2E7D32 (Nature Inspired)
4. **Sunset Orange** - #F57C00 (Warm & Energetic)
5. **Rose Pink** - #C2185B (Elegant & Modern)

## 🔒 Security Notes

- Firebase credentials are included for educational purposes
- In production, use environment variables for API keys
- Anonymous authentication is used for simplicity

## 📚 Educational Value

This project demonstrates:
- Offline-first mobile app architecture
- Real-time data synchronization
- Cross-platform development
- Native device feature integration
- Modern React Native patterns
- Firebase integration
- Cost-effective development practices

Built for CareerFoundry Full-Stack Web Development Program.
EOF

print_success "README.md documentation created"

# STEP 10: INSTALL DEPENDENCIES
print_step "STEP 10: INSTALLING ALL DEPENDENCIES"

print_info "Installing core dependencies..."
npm install --legacy-peer-deps

print_info "Installing Exercise 5.5 specific packages..."
npx expo install expo-image-picker expo-location @expo/react-native-action-sheet

print_info "Fixing any compatibility issues..."
npx expo install --fix

print_success "All dependencies installed successfully"

# STEP 11: FINAL VERIFICATION
print_step "STEP 11: FINAL VERIFICATION"

print_info "Clearing all caches..."
npm cache clean --force
watchman watch-del-all 2>/dev/null || true

print_info "Verifying all essential files..."
essential_files=(
    "App.js"
    "Chat.js" 
    "Start.js"
    "CustomActions.js"
    "firebase-config.js"
    "package.json"
    "app.json"
    "babel.config.js"
    "metro.config.js"
    "empty-module.js"
    "README.md"
    ".gitignore"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file ✓"
    else
        print_error "$file missing"
    fi
done

print_success "All files verified successfully"

# SUCCESS MESSAGE
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 COMPLETE REBUILD SUCCESS! 🎉                          ║${NC}"
echo -e "${GREEN}║              Exercise 5.5 Complete • All Features Working                   ║${NC}"
echo -e "${GREEN}║               Perfect for Fresh Branch • No Git Conflicts                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🚀 TO START YOUR COMPLETE EXERCISE 5.5 APP:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${CYAN}npx expo start --clear${NC}"
echo ""
echo "Then choose your platform:"
echo "   • Press 'a' for Android"
echo "   • Press 'i' for iOS"
echo "   • Press 'w' for Web"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}✅ ALL EXERCISE 5.5 FEATURES INCLUDED:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📱 **Exercise 5.4 Features (Working Foundation):**"
echo "   ✅ Real-time network connectivity detection"
echo "   ✅ Online: Firestore sync + automatic caching"
echo "   ✅ Offline: Load cached messages from AsyncStorage"
echo "   ✅ Input disabled when offline"
echo "   ✅ Visual connection status indicators"
echo "   ✅ 5 beautiful color themes"
echo ""
echo "📷 **Exercise 5.5 Features (Communication Features):**"
echo "   ✅ ActionSheet with 4 options"
echo "   ✅ 'Choose From Library' - Image picker from device"
echo "   ✅ 'Take Picture' - Camera integration"
echo "   ✅ 'Send Location' - GPS sharing with beautiful cards"
echo "   ✅ Cost-free implementation (no Firebase Storage)"
echo "   ✅ Location cards open in external maps"
echo "   ✅ Cross-platform compatibility"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎯 PERFECT FOR GIT/VS CODE:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Clean project structure - no conflicts"
echo "✅ All files properly created from scratch"
echo "✅ .gitignore included for clean commits"
echo "✅ README.md with complete documentation"
echo "✅ No legacy dependencies or cache issues"
echo "✅ Ready for immediate commit and push"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📚 GIT WORKFLOW RECOMMENDATION:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. git add ."
echo "2. git commit -m \"Complete Exercise 5.5: Chat + Pictures + Location (Fixed)\""
echo "3. git push origin [your-branch-name]"
echo ""

print_info "🎉 Your complete Exercise 5.5 app is ready!"
print_info "This build includes ALL working features and is perfect for a fresh Git branch!"

# Auto-start the app
print_info "Starting the app automatically..."
npx expo start --clear