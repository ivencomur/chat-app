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
  Alert,
} from 'react-native';
import { GiftedChat, InputToolbar, Bubble, Day, Send } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';

const { width } = Dimensions.get('window');

export default function Chat({ db, route, navigation, isConnected }) {
  const { userID, name, theme, sessionStartTime } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState(''); // State to control the text input

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('chat_messages'); // Clear cache on sign out
      navigation.navigate('Start');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: `${name} ${isConnected ? '🟢' : '🔴'}`,
      headerStyle: { backgroundColor: theme.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' },
      headerRight: () => (
        <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      ),
    });

    let unsubscribeMessages;
    if (isConnected) {
        // Only fetch messages created during this session
        const q = query(
            collection(db, 'messages'),
            where('createdAt', '>=', sessionStartTime),
            orderBy('createdAt', 'desc')
        );

        unsubscribeMessages = onSnapshot(q, async (snapshot) => {
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
            await cacheMessages(newMessages);
            setMessages(newMessages);
            setIsLoading(false);
        }, (error) => {
            console.error('Firestore error:', error);
            loadCachedMessages();
        });
    } else {
        loadCachedMessages();
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [isConnected, sessionStartTime]); // Add sessionStartTime to dependency array

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
      }
    } catch (error) {
      console.error('Cache load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cacheMessages = useCallback(async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('chat_messages', JSON.stringify(messagesToCache.slice(0, 50)));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, []);

  const onSend = useCallback(async (newMessages = []) => {
    if (newMessages.length > 0 && isConnected) {
      try {
        const message = {
          ...newMessages[0],
          createdAt: serverTimestamp(),
          user: { _id: userID, name: name },
        };
        await addDoc(collection(db, 'messages'), message);
      } catch (error) {
        console.error('Send error:', error);
      }
    }
  }, [isConnected, userID, name]);

  // Handles the "Enter" key press to send messages on web
  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter
      if (inputText.trim()) {
        const messageToSend = [{
          _id: Math.random().toString(36).substring(7),
          text: inputText.trim(),
          createdAt: new Date(),
          user: { _id: userID, name: name },
        }];
        onSend(messageToSend);
        setInputText(''); // Clear the input after sending
      }
    }
  };

  const renderInputToolbar = (props) => {
    if (!isConnected) return null;
    return <InputToolbar {...props} containerStyle={styles.inputToolbar} />;
  };

  const renderActions = (props) => {
    return <CustomActions userID={userID} {...props} />;
  };

  const renderCustomView = ({ currentMessage }) => {
    if (currentMessage.location) {
      const { latitude, longitude } = currentMessage.location;
      const url = Platform.select({
        ios: `maps:${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      });
      return (
        <TouchableOpacity style={styles.locationCard} onPress={() => Linking.openURL(url)}>
          <Text style={styles.locationTitle}>Location Shared</Text>
          <Text style={styles.locationSubtitle}>Tap to open in Maps</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderBubble = (props) => (
    <Bubble {...props} wrapperStyle={{ right: { backgroundColor: theme.primary }, left: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' } }} textStyle={{ right: { color: '#FFFFFF'}, left: { color: '#000000'}}} />
  );
  
  const renderSend = (props) => (
      <Send {...props} containerStyle={{ justifyContent: 'center'}}>
          <View style={[styles.sendContainer, { backgroundColor: theme.primary }]}>
              <Text style={styles.sendText}>Send</Text>
          </View>
      </Send>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => {
            onSend(messages);
            setInputText(''); // Clear input after sending with button
          }}
          user={{ _id: userID, name: name }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderActions={renderActions}
          renderCustomView={renderCustomView}
          renderSend={renderSend}
          placeholder={isConnected ? "Type a message..." : "You are offline"}
          alwaysShowSend
          text={inputText}
          onInputTextChanged={setInputText}
          textInputProps={{ onKeyPress: handleKeyPress }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  inputToolbar: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 6 },
  sendContainer: { marginRight: 10, marginBottom: 5, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  locationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, margin: 5, width: width * 0.7, borderWidth: 1, borderColor: '#E0E0E0' },
  locationTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },
  locationSubtitle: { fontSize: 12, color: '#666' },
});

