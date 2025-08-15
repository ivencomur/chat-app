import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const Chat = ({ db, route, navigation }) => {
  const { userID, name = 'User', theme = { name: 'Material Purple', primary: '#6200EE', secondary: '#3700B3', accent: '#BB86FC' } } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    navigation.setOptions({ 
      title: `${theme.name} • ${name}`,
      headerStyle: { backgroundColor: theme.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMessages = onSnapshot(q, (docs) => {
      let newMessages = [];
      docs.forEach(doc => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? new Date(data.createdAt.toMillis()) : new Date(),
          user: data.user
        });
      });
      setMessages(newMessages.reverse());
    });

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (inputText.trim()) {
      const newMessage = {
        text: inputText.trim(),
        createdAt: new Date(),
        user: { _id: userID, name: name }
      };
      
      addDoc(collection(db, "messages"), newMessage);
      setInputText('');
    }
  }, [inputText, userID, name]);

  const renderMessage = (message) => (
    <View key={message.id} style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        message.user._id === userID ? 
          [styles.myMessage, { backgroundColor: theme.primary }] : 
          styles.otherMessage
      ]}>
        <Text style={[
          styles.messageUser,
          { color: message.user._id === userID ? '#FFFFFF' : theme.secondary }
        ]}>
          {message.user.name}
        </Text>
        <Text style={[
          styles.messageText,
          { color: message.user._id === userID ? '#FFFFFF' : '#212121' }
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: message.user._id === userID ? '#E1BEE7' : '#757575' }
        ]}>
          {message.createdAt.toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map(renderMessage)}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: theme.primary }]}
      >
        <TextInput
          style={[styles.textInput, { borderColor: theme.accent }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#9E9E9E"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: theme.accent }]} 
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  messagesContent: { padding: 16 },
  messageContainer: { marginVertical: 4 },
  messageBubble: { padding: 16, borderRadius: 16, maxWidth: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  otherMessage: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageUser: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  messageText: { fontSize: 16, lineHeight: 20, marginBottom: 4 },
  messageTime: { fontSize: 10, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 16, alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 2, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, fontSize: 16, backgroundColor: '#FFFFFF', maxHeight: 100 },
  sendButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, justifyContent: 'center', alignItems: 'center', minWidth: 60 },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});

export default Chat;
