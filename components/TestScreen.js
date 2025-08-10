import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TestScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Navigation Works!</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Second')}
      >
        <Text style={styles.buttonText}>Go to Second Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
});
