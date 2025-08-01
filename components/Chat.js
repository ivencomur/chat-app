import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import 'react-native-safe-area-context';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const Chat = ({ route, navigation }) => {
  const { name, backgroundColor } = route.params;

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
        text: messageToSend.text,
        createdAt: serverTimestamp(),
        user: {
          _id: userId,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
        },
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
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "#FFF",
          }
        }}
      />
    );
  };
  
  const currentUser = useMemo(() => ({
    _id: userId,
    name: name,
  }), [userId, name]);

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderBubble={renderBubble}
        showUserAvatar={true}
        renderUsernameOnMessage={true}
        renderChatFooter={() => (
          Platform.OS === 'android' && <KeyboardAvoidingView behavior="height" />
        )}
      />
      {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
});

export default Chat;
