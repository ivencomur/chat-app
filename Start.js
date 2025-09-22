import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase-config';

const { width } = Dimensions.get('window');

export default function Start({ navigation }) {
  // State for user inputs
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const themes = [
    { name: 'Purple', primary: '#6200EE', secondary: '#3700B3', accent: '#BB86FC' },
    { name: 'Blue', primary: '#0277BD', secondary: '#01579B', accent: '#4FC3F7' },
    { name: 'Green', primary: '#2E7D32', secondary: '#1B5E20', accent: '#66BB6A' },
    { name: 'Orange', primary: '#F57C00', secondary: '#E65100', accent: '#FFB74D' },
    { name: 'Pink', primary: '#C2185B', secondary: '#AD1457', accent: '#F48FB1' }
  ];
  const currentTheme = themes[selectedTheme];

  const handleSignIn = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name to start chatting.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      // Pass the current time as the session start time
      navigation.navigate('Chat', {
        userID: userCredential.user.uid,
        name: trimmedName,
        theme: currentTheme,
        sessionStartTime: new Date(), // Add session start time
      });
      setName(''); // Reset name field after navigation
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      Alert.alert('Authentication Error', 'Failed to start a session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.primary }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>💬 Chat App</Text>
            <Text style={styles.subtitle}>Let´s join a Temporary Chat!</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your display name"
              autoCapitalize="words"
            />
            
            <Text style={styles.label}>Choose a Theme</Text>
            <View style={styles.themeContainer}>
              {themes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeDot,
                    { backgroundColor: theme.primary },
                    selectedTheme === index && styles.selectedTheme
                  ]}
                  onPress={() => setSelectedTheme(index)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.accent }]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Start Chatting</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 10 },
  title: { fontSize: width > 400 ? 48 : 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24 },
  
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 30,
  },
  themeDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTheme: {
    borderColor: '#000',
    transform: [{ scale: 1.2 }],
  },

  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

