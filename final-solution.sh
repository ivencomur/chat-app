#!/bin/bash

echo "🔥 FINAL SOLUTION - INFALLIBLE CHAT APP REPAIR"
echo "=============================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[REBUILD]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Function to kill lingering processes
kill_all_processes() {
    print_status "Terminating all Metro, Expo, and Node processes..."
    # For macOS and Linux
    pkill -f "metro" 2>/dev/null || true
    pkill -f "expo" 2>/dev/null || true
    pkill -f "react-native" 2>/dev/null || true
    # For Windows (Git Bash/Cygwin)
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        taskkill.exe //F //IM "node.exe" 2>/dev/null || true
    fi
    # A more general approach for ports
    for port in 8081 19000 19001 19002; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
}

# Function for a deep clean
nuclear_cleanup() {
    print_status "Performing nuclear cleanup..."
    rm -rf node_modules/ .expo/ .metro-cache/ package-lock.json yarn.lock
    rm -f App.js Start.js Chat.js firebase-config.js package.json app.json babel.config.js metro.config.js index.js
    npm cache clean --force 2>/dev/null || true
    watchman watch-del-all 2>/dev/null || true
}

# Create the corrected package.json
create_package_json() {
    print_status "Creating optimized package.json with all dependencies..."
cat > package.json << 'EOF'
{
  "name": "chat-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.18.2",
    "@react-native-community/netinfo": "9.3.10",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/native-stack": "^6.9.13",
    "expo": "~49.0.15",
    "expo-status-bar": "~1.6.0",
    "firebase": "^10.3.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.72.6",
    "react-native-gifted-chat": "^2.4.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-web": "~0.19.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
EOF
}

# Create all other project files
create_project_files() {
    print_status "Generating all project source and config files..."

cat > app.json << 'EOF'
{
  "expo": {
    "name": "Chat App",
    "slug": "chat-app",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#FFFFFF" } },
    "web": { "favicon": "./assets/favicon.png" }
  }
}
EOF

cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
EOF

cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
EOF

cat > index.js << 'EOF'
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
EOF

cat > firebase-config.js << 'EOF'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAFQtuqjFeJmr2sAfBQ4TN4qojLfrXjOg",
  authDomain: "my-chat-app-project-careerfoun.firebaseapp.com",
  projectId: "my-chat-app-project-careerfoun",
  storageBucket: "my-chat-app-project-careerfoun.appspot.com",
  messagingSenderId: "781458415749",
  appId: "1:781458415749:web:405fe94458d23ddc0889ec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
EOF

cat > App.js << 'EOF'
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import Start from './Start';
import Chat from './Chat';

const Stack = createNativeStackNavigator();

// Initialize Firestore outside the component to avoid re-initialization
const db = getFirestore();

const App = () => {
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('Connection Lost!', 'You are now in offline mode.');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        <Stack.Screen name="Start" component={Start} options={{ headerShown: false }} />
        <Stack.Screen name="Chat">
          {props => <Chat db={db} isConnected={connectionStatus.isConnected} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
EOF

cat > Start.js << 'EOF'
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#6200EE');
  const auth = getAuth();

  const colorThemes = [
    { name: 'Material Purple', primary: '#6200EE' }, { name: 'Ocean Blue', primary: '#0277BD' },
    { name: 'Forest Green', primary: '#2E7D32' }, { name: 'Sunset Orange', primary: '#F57C00' }
  ];

  const signInUser = () => {
    signInAnonymously(auth)
      .then(result => {
        navigation.navigate('Chat', {
          userID: result.user.uid,
          name: name.trim() || 'User',
          theme: { primary: backgroundColor }
        });
      })
      .catch((error) => {
        Alert.alert("Error", "Unable to sign in. Please try again later.");
      });
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Chat App</Text>
        <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder='Your name'
            />
            <Text>Choose Background Color:</Text>
            <View style={styles.colorSelectionContainer}>
              {colorThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.primary}
                  style={[styles.colorOption, { backgroundColor: theme.primary }, backgroundColor === theme.primary && styles.selectedColor]}
                  onPress={() => setBackgroundColor(theme.primary)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: backgroundColor }]}
              onPress={signInUser}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
        </View>
        {Platform.OS === 'ios' ? <View style={{ height: 30 }} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  title: { fontSize: 45, fontWeight: '600', color: '#2c3e50' },
  inputContainer: { width: '88%', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  textInput: { width: '88%', padding: 15, borderWidth: 1, borderColor: '#757083', borderRadius: 5, marginBottom: 15 },
  colorSelectionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '88%', marginVertical: 10 },
  colorOption: { width: 50, height: 50, borderRadius: 25 },
  selectedColor: { borderWidth: 3, borderColor: '#2c3e50' },
  button: { padding: 15, borderRadius: 5, width: '88%', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' }
});

export default Start;
EOF

cat > Chat.js << 'EOF'
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GiftedChat, InputToolbar, Bubble } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({ db, route, navigation, isConnected }) => {
  const { userID, name, theme } = route.params;
  const [messages, setMessages] = useState([]);

  // Load messages from cache or Firestore
  useEffect(() => {
    navigation.setOptions({ title: name, headerStyle: { backgroundColor: theme.primary } });

    let unsubMessages;
    if (isConnected === true) {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (docs) => {
        let newMessages = [];
        docs.forEach(doc => {
          const data = doc.data();
          newMessages.push({
            _id: doc.id,
            text: data.text,
            createdAt: new Date(data.createdAt.toMillis()),
            user: data.user,
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else {
      loadCachedMessages();
    }
    
    // Unsubscribe from listener when component unmounts
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  // Load cached messages from AsyncStorage
  const loadCachedMessages = async () => {
    const cachedMessages = await AsyncStorage.getItem("chat_messages") || "[]";
    setMessages(JSON.parse(cachedMessages));
  };

  // Cache messages to AsyncStorage
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('chat_messages', JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to handle sending messages
  const onSend = useCallback((newMessages = []) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  }, []);

  // Conditionally render the input toolbar
  const renderInputToolbar = (props) => {
    if (isConnected) {
      return <InputToolbar {...props} />;
    } else {
      return null;
    }
  };
  
  // Customize message bubble color
  const renderBubble = (props) => {
    return <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#000"
        },
        left: {
          backgroundColor: "#FFF"
        }
      }}
    />
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
        <GiftedChat
            messages={messages}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            onSend={messages => onSend(messages)}
            user={{
                _id: userID,
                name: name
            }}
        />
        { Platform.OS === 'android' ? <View style={{ height: 30, backgroundColor: theme.primary }} /> : null }
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
EOF
}

# --- Main Script Execution ---

kill_all_processes
nuclear_cleanup
create_package_json
create_project_files

print_status "Installing dependencies with npm..."
npm install

print_success "Project rebuild complete! Your chat app is ready."
echo "To start the app, run: npm start"