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
