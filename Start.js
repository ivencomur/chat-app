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
  Alert
} from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase-config';

const { width, height } = Dimensions.get('window');

export default function Start({ navigation }) {
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 5 beautiful themes for Exercise 5.4/5.5
  const themes = [
    { name: 'Material Purple', primary: '#6200EE', secondary: '#3700B3', accent: '#BB86FC' },
    { name: 'Ocean Blue', primary: '#0277BD', secondary: '#01579B', accent: '#4FC3F7' },
    { name: 'Forest Green', primary: '#2E7D32', secondary: '#1B5E20', accent: '#66BB6A' },
    { name: 'Sunset Orange', primary: '#F57C00', secondary: '#E65100', accent: '#FFB74D' },
    { name: 'Rose Pink', primary: '#C2185B', secondary: '#AD1457', accent: '#F48FB1' }
  ];

  const currentTheme = themes[selectedTheme];

  const handleSignIn = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Username Required', 'Please enter your name to start chatting.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInAnonymously(auth);
      navigation.navigate('Chat', {
        userID: result.user.uid,
        name: trimmedName,
        theme: currentTheme
      });
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>💬 Chat App</Text>
            <Text style={styles.subtitle}>Exercise 5.5 • Complete Features</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              maxLength={25}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <Text style={styles.label}>Choose Theme (5 Options)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themeScroll}
            >
              {themes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeCard,
                    { backgroundColor: theme.primary },
                    selectedTheme === index && styles.selectedTheme
                  ]}
                  onPress={() => setSelectedTheme(index)}
                  disabled={isLoading}
                >
                  <View style={styles.themePreview}>
                    <View style={[styles.dot, { backgroundColor: theme.secondary }]} />
                    <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                  </View>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, minHeight: height - 100 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: width > 400 ? 48 : 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, maxWidth: 500, width: '100%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24 },
  themeScroll: { marginBottom: 24, maxHeight: 100 },
  themeCard: { width: 90, height: 80, borderRadius: 12, marginRight: 10, padding: 8, justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent' },
  selectedTheme: { borderColor: '#000', transform: [{ scale: 1.05 }] },
  themePreview: { flexDirection: 'row', justifyContent: 'flex-end' },
  dot: { width: 10, height: 10, borderRadius: 5, marginLeft: 4 },
  themeName: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});
