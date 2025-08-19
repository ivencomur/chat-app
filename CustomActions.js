import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const CustomActions = ({ onSend, userID }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to share photos!');
        return;
      }

      // Launch image picker
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
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
        return;
      }

      // Launch camera
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
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const getLocation = async () => {
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need location permissions to share your location!');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (location) {
        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          text: 'Location shared',
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        }]);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };

  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = 3;
    
    showActionSheetWithOptions(
      { 
        options, 
        cancelButtonIndex,
        title: 'Communication Features'
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: 
            pickImage(); 
            break;
          case 1: 
            takePhoto(); 
            break;
          case 2: 
            getLocation(); 
            break;
          default:
            // Cancel - do nothing
            break;
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
  container: { 
    width: 26, 
    height: 26, 
    marginLeft: 10, 
    marginBottom: 10 
  },
  wrapper: { 
    borderRadius: 13, 
    borderColor: '#b2b2b2', 
    borderWidth: 2, 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconText: { 
    color: '#b2b2b2', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default CustomActions;
