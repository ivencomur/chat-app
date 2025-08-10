import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  Alert
} from 'react-native';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#048673');

  const colors = ['#090C08', '#048673', '#f88f1f', '#8A95A5'];

  const handleStartChatting = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') {
      if (Platform.OS === 'web') {
        alert('Please enter your username to start chatting.');
      } else {
        Alert.alert('Username Required', 'Please enter your username to start chatting.');
      }
      return;
    }
    
    navigation.navigate('Chat', { 
      name: trimmedName, 
      backgroundColor: backgroundColor 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f0f0f0' }]}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 Chat App</Text>
        <Text style={styles.subtitle}>Running on: {Platform.OS}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder='Type your username here'
            placeholderTextColor="#757083"
            maxLength={20}
          />
          
          <Text style={styles.chooseColorText}>Choose Background Color:</Text>
          
          <View style={styles.colorSelectionContainer}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={`color-${index}`}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  backgroundColor === color && styles.selectedColor
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: backgroundColor }]}
            onPress={handleStartChatting}
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#048673',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  chooseColorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  button: {
    padding: 15,
    borderRadius: 8,
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
