import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

const Chat = ({ route, navigation }) => {
  const { name, backgroundColor } = route.params;

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: name });

    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
      {
        _id: 2,
        text: 'You have entered the chat.',
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, [name, navigation]);

  const onSend = (newMessages) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

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

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
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
});

export default Chat;
