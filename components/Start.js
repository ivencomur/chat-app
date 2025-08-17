import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const { width } = Dimensions.get('window');

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#6200EE');
  const auth = getAuth();

  const colorThemes = [
    { name: 'Material Purple', primary: '#6200EE', secondary: '#3700B3', accent: '#BB86FC' },
    { name: 'Ocean Blue', primary: '#0277BD', secondary: '#01579B', accent: '#4FC3F7' },
    { name: 'Forest Green', primary: '#2E7D32', secondary: '#1B5E20', accent: '#66BB6A' },
    { name: 'Sunset Orange', primary: '#F57C00', secondary: '#E65100', accent: '#FFB74D' },
    { name: 'Rose Pink', primary: '#C2185B', secondary: '#AD1457', accent: '#F48FB1' },
    { name: 'Deep Teal', primary: '#00695C', secondary: '#004D40', accent: '#4DB6AC' },
    { name: 'Royal Purple', primary: '#7B1FA2', secondary: '#4A148C', accent: '#CE93D8' },
    { name: 'Crimson Red', primary: '#D32F2F', secondary: '#B71C1C', accent: '#EF5350' },
    { name: 'Midnight Blue', primary: '#1565C0', secondary: '#0D47A1', accent: '#42A5F5' },
    { name: 'Emerald Green', primary: '#388E3C', secondary: '#2E7D32', accent: '#81C784' },
    { name: 'Amber Gold', primary: '#FF8F00', secondary: '#FF6F00', accent: '#FFD54F' },
    { name: 'Indigo Night', primary: '#303F9F', secondary: '#1A237E', accent: '#7986CB' },
    { name: 'Slate Gray', primary: '#455A64', secondary: '#263238', accent: '#90A4AE' },
    { name: 'Copper Bronze', primary: '#8D6E63', secondary: '#5D4037', accent: '#BCAAA4' }
  ];

  const signInUser = () => {
    signInAnonymously(auth)
      .then(result => {
        const selectedTheme = colorThemes.find(theme => theme.primary === backgroundColor) || colorThemes[0];
        navigation.navigate('Chat', { 
          userID: result.user.uid,
          name: name.trim(),
          theme: selectedTheme
        });
      })
      .catch((error) => {
        console.error('Authentication error:', error);
        const message = 'Unable to sign in. Please try again.';
        Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      });
  };

  const handleStartChatting = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') {
      const message = 'Please enter your username to start chatting.';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Username Required', message);
      return;
    }
    signInUser();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>💬 Chat App</Text>
          <Text style={styles.subtitle}>Cross-Platform Messaging • {Platform.OS}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder='Enter your username'
              placeholderTextColor="#9E9E9E"
              maxLength={25}
            />
            
            <Text style={styles.chooseColorText}>Choose Your Theme:</Text>
            
            <ScrollView 
              style={styles.colorScrollView}
              contentContainerStyle={styles.colorSelectionContainer}
              showsVerticalScrollIndicator={false}
            >
              {colorThemes.map((theme, index) => (
                <TouchableOpacity
                  key={`theme-${index}`}
                  style={[
                    styles.colorOption,
                    { backgroundColor: theme.primary },
                    backgroundColor === theme.primary && styles.selectedColor
                  ]}
                  onPress={() => setBackgroundColor(theme.primary)}
                >
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, { backgroundColor: theme.secondary }]} />
                    <View style={[styles.colorDot, { backgroundColor: theme.accent }]} />
                  </View>
                  <Text style={styles.colorName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: backgroundColor }]}
              onPress={handleStartChatting}
            >
              <Text style={styles.buttonText}>Start Chatting 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: Platform.OS === 'web' ? '100vh' : undefined },
  title: { fontSize: 42, fontWeight: 'bold', color: '#212121', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#757575', marginBottom: 40, textAlign: 'center' },
  inputContainer: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#424242', alignSelf: 'flex-start', marginBottom: 8 },
  textInput: { width: '100%', padding: 16, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, fontSize: 16, marginBottom: 24, backgroundColor: '#FAFAFA', color: '#212121' },
  chooseColorText: { fontSize: 16, fontWeight: '600', color: '#424242', marginBottom: 16, alignSelf: 'flex-start' },
  colorScrollView: { maxHeight: 200, width: '100%', marginBottom: 24 },
  colorSelectionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  colorOption: { width: (width * 0.8 - 80) / 2, height: 80, borderRadius: 12, marginBottom: 12, padding: 8, justifyContent: 'space-between', borderWidth: 3, borderColor: 'transparent' },
  selectedColor: { borderColor: '#212121', transform: [{ scale: 1.05 }] },
  colorPreview: { flexDirection: 'row', justifyContent: 'flex-end' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 4 },
  colorName: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  button: { padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }
});

export default Start;