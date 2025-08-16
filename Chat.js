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
