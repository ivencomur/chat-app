import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const CustomActions = ({ onSend, userID }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          image: result.assets[0].uri,
          text: '',
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          image: result.assets[0].uri,
          text: '',
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          text: '📍 Location shared',
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = 3;
    
    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: pickImage(); break;
          case 1: takePhoto(); break;
          case 2: getLocation(); break;
        }
      }
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={styles.wrapper}>
        <Text style={styles.iconText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 26, height: 26, marginLeft: 10, marginBottom: 10 },
  wrapper: { borderRadius: 13, borderColor: '#b2b2b2', borderWidth: 2, flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#b2b2b2', fontWeight: 'bold', fontSize: 16 },
});

export default CustomActions;
