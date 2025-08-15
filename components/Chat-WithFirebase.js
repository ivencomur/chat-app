import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Dimensions
} from 'react-native';
import { GiftedChat, Bubble, Send, Actions } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { auth, db } from './firebase-config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const { width } = Dimensions.get('window');

const Chat = ({ route, navigation }) => {
  const { name = 'User', backgroundColor = '#048673' } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const createMockMessages = useCallback(() => [
    {
      _id: Math.round(Math.random() * 1000000),
      text: 'Welcome to the chat! 🎉\n\nThis is a demo message. To enable real-time chat, configure Firebase in firebase-config.js',
      createdAt: new Date(),
      user: {
        _id: 'system',
        name: 'System',
        avatar: 'https://placeimg.com/140/140/tech',
      },
    },
  ], []);

  useEffect(() => {
    navigation.setOptions({ 
      title: name,
      headerStyle: {
        backgroundColor: backgroundColor,
      },
      headerTintColor: '#fff',
    });

    initializeChat();
  }, [name, navigation, backgroundColor]);

  const initializeChat = async () => {
    try {
      await signInAnonymously(auth);
      
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          setIsConnected(true);
          setupMessageListener();
        } else {
          setUserId(null);
          setIsConnected(false);
          setMessages(createMockMessages());
        }
        setIsLoading(false);
      });

      return () => unsubscribeAuth();
    } catch (error) {
      console.error("Error initializing chat:", error);
      setMessages(createMockMessages());
      setUserId('fallback-user-' + Math.random().toString(36).substring(7));
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  const setupMessageListener = () => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text || '',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            user: {
              _id: data.user._id,
              name: data.user.name,
              avatar: data.user.avatar || 'https://placeimg.com/140/140/people',
            },
            image: data.image || null,
            location: data.location || null
          };
        });
        setMessages(loadedMessages);
      }, (error) => {
        console.error("Error loading messages:", error);
        setMessages(createMockMessages());
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up message listener:", error);
      setMessages(createMockMessages());
    }
  };

  const onSend = useCallback(async (newMessages = []) => {
    if (!userId) {
      console.warn("User not authenticated. Cannot send message.");
      return;
    }

    const messageToSend = newMessages[0];
    
    if (isConnected) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: messageToSend.text || null,
          createdAt: serverTimestamp(),
          user: {
            _id: userId,
            name: name,
            avatar: 'https://placeimg.com/140/140/people',
          },
          image: messageToSend.image || null,
          location: messageToSend.location || null
        });
      } catch (error) {
        console.error("Error sending message to Firebase:", error);
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
      }
    } else {
      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    }
  }, [userId, name, isConnected]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: backgroundColor,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 5,
          },
          left: {
            backgroundColor: "#ffffff",
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 15,
          }
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#000',
          }
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={[styles.sendContainer, { backgroundColor: backgroundColor }]}>
          <Text style={styles.sendText}>Send</Text>
        </View>
      </Send>
    );
  };

  const renderMessageImage = (props) => {
    if (!props.currentMessage.image) return null;
    
    return (
      <TouchableOpacity style={styles.messageImageContainer}>
        <Image 
          source={{ uri: props.currentMessage.image }} 
          style={styles.messageImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderMessageText = (props) => {
    const { currentMessage } = props;
    
    if (currentMessage.location) {
      return (
        <TouchableOpacity style={styles.messageLocationContainer}>
          <Text style={styles.messageLocationText}>
            📍 Location Shared
          </Text>
          <Text style={styles.messageLocationCoords}>
            {currentMessage.location.latitude.toFixed(4)}, {currentMessage.location.longitude.toFixed(4)}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  const showActionSheet = useCallback(() => {
    Alert.alert(
      "Share Content",
      "What would you like to share?",
      [
        { text: 'Photo', onPress: pickImage },
        { text: 'Location', onPress: getLocation },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to share photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newMessage = {
          _id: Math.round(Math.random() * 1000000),
          image: result.assets[0].uri,
          text: '',
          createdAt: new Date(),
          user: {
            _id: userId,
            name: name,
          }
        };
        onSend([newMessage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, [userId, name, onSend]);

  const getLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need location permissions to share your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      if (location) {
        const newMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: `📍 Shared location`,
          createdAt: new Date(),
          user: {
            _id: userId,
            name: name,
          },
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        };
        onSend([newMessage]);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please check your GPS settings.');
    }
  }, [userId, name, onSend]);

  const renderActions = (props) => {
    return (
      <Actions
        {...props}
        onPressActionButton={showActionSheet}
        icon={() => (
          <View style={[styles.customActionsContainer, { backgroundColor: backgroundColor }]}>
            <Text style={styles.customActionsText}>+</Text>
          </View>
        )}
      />
    );
  };

  const currentUser = useMemo(() => ({
    _id: userId || 'default-user',
    name: name,
    avatar: 'https://placeimg.com/140/140/people',
  }), [userId, name]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 88, android: 0 })}
      >
        <View style={styles.chatContainer}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={currentUser}
            renderBubble={renderBubble}
            renderSend={renderSend}
            renderActions={renderActions}
            renderMessageImage={renderMessageImage}
            renderMessageText={renderMessageText}
            showUserAvatar={false}
            scrollToBottom
            scrollToBottomStyle={styles.scrollToBottomStyle}
            alwaysShowSend
            showAvatarForEveryMessage={false}
            renderUsernameOnMessage={true}
            placeholder="Type a message..."
            minInputToolbarHeight={44}
          />
        </View>
        
        {isConnected && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>
              🔥 Firebase Connected - Real-time chat enabled!
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customActionsContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginBottom: 0,
    borderRadius: 22,
  },
  customActionsText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageImageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 5,
  },
  messageImage: {
    width: width * 0.6,
    height: width * 0.45,
    borderRadius: 15,
  },
  messageLocationContainer: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#e8f4f8',
    marginVertical: 5,
  },
  messageLocationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageLocationCoords: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  scrollToBottomStyle: {
    backgroundColor: '#048673',
  },
  offlineIndicator: {
    backgroundColor: '#4CAF50',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Chat;