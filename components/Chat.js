import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import 'react-native-safe-area-context';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const Chat = ({ route, navigation }) => {
  const { name = '', backgroundColor = '#048673' } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: name });
    
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; 

    const app = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setDb(firestoreDb);

    const authenticate = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(firebaseAuth, initialAuthToken);
        } else {
          await signInAnonymously(firebaseAuth);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };

    authenticate();

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribeAuth();
  }, [name, navigation]);

  useEffect(() => {
    if (!db || !userId) return;

    const messagesCollectionRef = collection(db, `artifacts/${__app_id}/public/data/messages`);
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        const giftedChatUser = {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        };
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: giftedChatUser,
          image: data.image || null,
          location: data.location || null
        };
      });
      setMessages(loadedMessages.reverse());
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  const onSend = useCallback(async (newMessages = []) => {
    if (!db || !userId) {
      console.warn("Firestore not initialized or user not authenticated. Cannot send message.");
      return;
    }

    const messageToSend = newMessages[0];
    try {
      await addDoc(collection(db, `artifacts/${__app_id}/public/data/messages`), {
        text: messageToSend.text || null,
        createdAt: serverTimestamp(),
        user: {
          _id: userId,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
        },
        image: messageToSend.image || null,
        location: messageToSend.location || null
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [db, userId, name]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#048673",
          },
          left: {
            backgroundColor: "#ffffff",
          }
        }}
      />
    );
  };

  const showActionSheet = useCallback(async (props) => {
    const options = ['Pick an Image', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    Alert.alert(
      "Choose an action",
      "What would you like to send?",
      options.map((option, index) => ({
        text: option,
        onPress: () => {
          if (index === 0) pickImage(props);
          else if (index === 1) getLocation(props);
        },
      })),
      { cancelable: true }
    );
  }, []);

  const pickImage = useCallback(async (props) => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions.granted === false) {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      props.onSend({ image: result.assets[0].uri, user: props.user, createdAt: new Date() });
    }
  }, []);

  const getLocation = useCallback(async (props) => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions.granted === false) {
      Alert.alert('Permission to access location is required!');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    if (location) {
      props.onSend({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        text: `My location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
        user: props.user,
        createdAt: new Date()
      });
    }
  }, []);

  const renderCustomActions = useCallback((props) => {
    return (
      <TouchableOpacity style={styles.customActionsContainer} onPress={() => showActionSheet(props)}>
        <Text style={styles.customActionsText}>+</Text>
      </TouchableOpacity>
    );
  }, [showActionSheet]);
  
  const currentUser = useMemo(() => ({
    _id: userId,
    name: name,
  }), [userId, name]);

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={currentUser}
          renderBubble={renderBubble}
          showUserAvatar={true}
          renderUsernameOnMessage={true}
          renderActions={renderCustomActions}
          renderMessageImage={renderMessageImage}
          renderMessageText={renderMessageText}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  customActionsContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 10,
    borderRadius: 22,
    backgroundColor: '#048673',
  },
  customActionsText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#048673',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  messageImageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
    resizeMode: 'cover',
  },
  messageLocationContainer: {
    padding: 10,
    borderRadius: 15,
  },
  messageLocationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Chat;
