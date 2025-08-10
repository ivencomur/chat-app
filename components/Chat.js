import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';

const Chat = ({ route, navigation }) => {
  const { name = 'User', backgroundColor = '#048673' } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    navigation.setOptions({ 
      title: `Chat - ${name}`,
      headerStyle: { backgroundColor: backgroundColor },
      headerTintColor: '#fff',
    });

    // Add welcome message
    setMessages([
      {
        id: 1,
        text: `Welcome ${name}! 🎉 Your chat app is working perfectly on ${Platform.OS}!`,
        user: 'System',
        timestamp: new Date(),
      }
    ]);
  }, [name, navigation, backgroundColor]);

  const sendMessage = useCallback(() => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputText.trim(),
        user: name,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    }
  }, [inputText, name]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageItem}>
            <View style={[
              styles.messageBubble,
              message.user === name ? styles.myMessage : styles.otherMessage
            ]}>
              <Text style={styles.messageUser}>{message.user}</Text>
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
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
  messagesContent: {
    padding: 10,
  },
  messageItem: {
    marginVertical: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageUser: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chat;
