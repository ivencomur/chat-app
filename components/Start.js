import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#048673');

  const colors = ['#090C08', '#048673', '#f88f1f', '#8A95A5'];

  const handleStartChatting = () => {
    if (name.trim() === '') {
      console.warn("Please enter your username to start chatting.");
      return;
    }
    navigation.navigate('Chat', { name: name, backgroundColor: backgroundColor });
  };

  return (
    <ImageBackground source={require('../assets/background-image.png')} style={styles.backgroundImage}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        <View style={styles.containerContent}>
          <Text style={styles.appTitle}>Chat App</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder='Type your username here'
              accessible={true}
              accessibilityLabel="Your username input"
              accessibilityHint="Type your desired username here"
            />
            <Text style={styles.chooseColorText}>Choose Background Color:</Text>
            <View style={styles.colorSelectionContainer}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    backgroundColor === color && styles.selectedColor
                  ]}
                  onPress={() => setBackgroundColor(color)}
                  accessible={true}
                  accessibilityLabel={`Color option: ${color}`}
                  accessibilityHint={`Sets the chat background to ${color}. Currently ${backgroundColor === color ? 'selected' : 'not selected'}.`}
                  accessibilityRole="button"
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: backgroundColor }]}
              onPress={handleStartChatting}
              accessible={true}
              accessibilityLabel="Start Chatting"
              accessibilityHint="Navigates to the chat screen with your chosen username and background color."
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  containerContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '6%',
  },
  appTitle: {
    fontSize: 45,
    fontWeight: '600',
    color: '#048673',
    marginTop: 60,
    marginBottom: 20,
  },
  inputContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#757083',
    borderRadius: 5,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 20,
  },
  chooseColorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 10,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Start;
