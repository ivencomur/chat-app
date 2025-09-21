import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Text, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from './firebase-config';
import Start from './Start';
import Chat, { clearCache } from './Chat';

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
  const connectionStatus = useNetInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [networkMessage, setNetworkMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        clearCache();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (connectionStatus.isConnected === false) {
      setNetworkMessage('📱 Offline Mode - Reading cached messages');
      disableNetwork(db).catch(console.error);
    } else if (connectionStatus.isConnected === true) {
      setNetworkMessage('🌐 Online - Syncing messages');
      enableNetwork(db).catch(console.error);
    }
    
    const timer = setTimeout(() => setNetworkMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [connectionStatus.isConnected, isInitialized]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading Chat App...</Text>
      </View>
    );
  }

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <StatusBar style="light" />
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
          <Stack.Screen name="Chat">
            {props => (
              <Chat
                db={db}
                isConnected={connectionStatus.isConnected}
                {...props}
                {...props.route?.params}
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

