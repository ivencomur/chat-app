import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const Chat = ({ route, navigation, db }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { userID, name, color } = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: { backgroundColor: color },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    });

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

    const unsubMessages = onSnapshot(q, (docs) => {
      let newMessages = [];
      docs.forEach(doc => {
        const data = doc.data();
        newMessages.push({
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: data.user
        });
      });
      setMessages(newMessages.reverse());
    });

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, []);

  const sendMessage = () => {
    if (inputText.trim()) {
      const message = {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        user: {
          _id: userID,
          name: name
        }
      };

      addDoc(collection(db, "messages"), message);
      setInputText('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message._id} style={styles.messageItem}>
            <View style={[
              styles.messageBubble,
              message.user._id === userID ?
                [styles.myMessage, { backgroundColor: color }] :
                styles.otherMessage
            ]}>
              <Text style={styles.messageUser}>{message.user.name}</Text>
              <Text style={[
                styles.messageText,
                message.user._id === userID ? styles.myMessageText : styles.otherMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.user._id === userID ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {message.createdAt?.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: color }]}
            onPress={sendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageItem: {
    marginVertical: 8,
    marginHorizontal: 15,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    maxWidth: '80%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
    }),
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 8,
    marginLeft: 50,
  },
  otherMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 8,
    marginRight: 50,
  },
  messageUser: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  myMessageTime: {
    color: '#ffffff',
  },
  otherMessageTime: {
    color: '#666666',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
      },
    }),
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Chat;