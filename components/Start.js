import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#090C08');

  const auth = getAuth();

  const colors = [
    '#090C08',
    '#474056', 
    '#8A95A5',
    '#B9C6AE',
    '#048673',
    '#f88f1f',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3'
  ];

  const signInUser = () => {
    if (!name.trim()) {
      Alert.alert('Please enter your name');
      return;
    }

    signInAnonymously(auth)
      .then(result => {
        navigation.navigate('Chat', {
          userID: result.user.uid,
          name: name.trim(),
          color: selectedColor
        });
        Alert.alert('Signed in Successfully!');
      })
      .catch((error) => {
        console.error('Authentication error:', error);
        Alert.alert('Unable to sign in, try again later.');
      });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>💬 Chat App</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'web' ? '🌐 Web Version' : 
             Platform.OS === 'ios' ? '📱 iOS Version' : 
             '🤖 Android Version'}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor="#757083"
          />

          <View style={styles.colorContainer}>
            <Text style={styles.colorText}>Choose Background Color:</Text>
            <View style={styles.colorGrid}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: selectedColor }]}
            onPress={signInUser}
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>

          {Platform.OS !== 'web' && (
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                💡 If app doesn't work on phone:
              </Text>
              <Text style={styles.versionText}>
                1. Update Expo Go app from store
              </Text>
              <Text style={styles.versionText}>
                2. Or try web version instead
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#090C08',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    width: '88%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  textInput: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    borderWidth: 1,
    borderColor: '#757083',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  colorContainer: {
    marginBottom: 20,
  },
  colorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 10,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#757083',
    borderWidth: 3,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default Start;