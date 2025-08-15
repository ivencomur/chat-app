import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const Chat = ({ db, route, navigation }) => {
  const { userID, name = 'User', theme = { 
    name: 'Material Purple', 
    primary: '#6200EE', 
    secondary: '#3700B3', 
    accent: '#BB86FC' 
  }} = route.params || {};

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({ 
      title: `${theme.name} • ${name}`,
      headerStyle: { 
        backgroundColor: theme.primary,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMessages = onSnapshot(q, (docs) => {
      let newMessages = [];
      docs.forEach(doc => {
        const data = doc.data();
        newMessages.push({
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? new Date(data.createdAt.toMillis()) : new Date(),
          user: data.user
        });
      });
      setMessages(newMessages);
    });

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, []);

  const onSend = useCallback((newMessages = []) => {
    if (newMessages.length > 0) {
      addDoc(collection(db, "messages"), newMessages[0]);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.secondary }]}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: userID || 'default-user',
          name: name
        }}
        renderBubble={(props) => {
          const isCurrentUser = props.currentMessage.user._id === userID;
          return (
            <View style={[
              styles.bubble,
              isCurrentUser ? 
                [styles.rightBubble, { backgroundColor: theme.primary }] : 
                styles.leftBubble
            ]}>
              <View style={styles.messageContent}>
                {!isCurrentUser && (
                  <View style={styles.userInfo}>
                    <View style={styles.userName}>
                      {props.children}
                    </View>
                  </View>
                )}
                <View style={styles.messageText}>
                  {props.children}
                </View>
                <View style={styles.messageTime}>
                  {props.children}
                </View>
              </View>
            </View>
          );
        }}
        placeholder="Type a message..."
        alwaysShowSend
        showUserAvatar={false}
        scrollToBottom
        scrollToBottomStyle={{ backgroundColor: theme.primary }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bubble: {
    padding: 10,
    marginVertical: 2,
    marginHorizontal: 10,
    borderRadius: 15,
    maxWidth: '80%',
  },
  rightBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  leftBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageContent: {
    flex: 1,
  },
  userInfo: {
    marginBottom: 2,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default Chat;