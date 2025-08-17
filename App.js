import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
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
]);

const Stack = createNativeStackNavigator();

export default function App() {
  // EXERCISE 5.4 STEP 1: Real-time network connectivity detection
  const connectionStatus = useNetInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [networkMessage, setNetworkMessage] = useState('');

  // Initialize app after a brief delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // EXERCISE 5.4 STEP 1: Handle network status changes
  useEffect(() => {
    if (!isInitialized) return;

    if (connectionStatus.isConnected === false) {
      setNetworkMessage('📱 Offline Mode - Reading cached messages');
      // EXERCISE 5.4 STEP 1: Disable Firestore when offline
      disableNetwork(db).catch(console.error);
    } else if (connectionStatus.isConnected === true) {
      setNetworkMessage('🌐 Online - Syncing messages');
      // EXERCISE 5.4 STEP 1: Enable Firestore when online
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
        <Text style={styles.loadingText}>Loading Chat App...</Text>
      </View>
    );
  }

  return (
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
        {/* EXERCISE 5.4 STEP 1: Pass isConnected prop to Chat component */}
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
