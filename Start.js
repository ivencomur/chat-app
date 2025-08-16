import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#6200EE');
  const auth = getAuth();

  const colorThemes = [
    { name: 'Material Purple', primary: '#6200EE' }, { name: 'Ocean Blue', primary: '#0277BD' },
    { name: 'Forest Green', primary: '#2E7D32' }, { name: 'Sunset Orange', primary: '#F57C00' }
  ];

  const signInUser = () => {
    signInAnonymously(auth)
      .then(result => {
        navigation.navigate('Chat', {
          userID: result.user.uid,
          name: name.trim() || 'User',
          theme: { primary: backgroundColor }
        });
      })
      .catch((error) => {
        Alert.alert("Error", "Unable to sign in. Please try again later.");
      });
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Chat App</Text>
        <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder='Your name'
            />
            <Text>Choose Background Color:</Text>
            <View style={styles.colorSelectionContainer}>
              {colorThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.primary}
                  style={[styles.colorOption, { backgroundColor: theme.primary }, backgroundColor === theme.primary && styles.selectedColor]}
                  onPress={() => setBackgroundColor(theme.primary)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: backgroundColor }]}
              onPress={signInUser}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
        </View>
        {Platform.OS === 'ios' ? <View style={{ height: 30 }} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  title: { fontSize: 45, fontWeight: '600', color: '#2c3e50' },
  inputContainer: { width: '88%', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  textInput: { width: '88%', padding: 15, borderWidth: 1, borderColor: '#757083', borderRadius: 5, marginBottom: 15 },
  colorSelectionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '88%', marginVertical: 10 },
  colorOption: { width: 50, height: 50, borderRadius: 25 },
  selectedColor: { borderWidth: 3, borderColor: '#2c3e50' },
  button: { padding: 15, borderRadius: 5, width: '88%', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' }
});

export default Start;
