import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Platform } from 'react-native';
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
      if (Platform.OS === 'web') {
        Alert.alert('Web Limitation', 'Image picker has limited support on web. Please try on mobile for full functionality.');
      } else {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Web Limitation', 
          'Camera capture is not available on web. Please use "Choose From Library" instead, or try on mobile for full camera functionality.'
        );
        return;
      }

      // Request permissions (mobile only)
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
      if (Platform.OS === 'web') {
        // Web geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              onSend([{
                _id: Math.round(Math.random() * 1000000),
                createdAt: new Date(),
                user: { _id: userID },
                text: 'Location shared',
                location: {
                  longitude: position.coords.longitude,
                  latitude: position.coords.latitude,
                },
              }]);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              Alert.alert('Location Error', 'Failed to get location. Please allow location access in your browser.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        } else {
          Alert.alert('Not Supported', 'Geolocation is not supported by this browser.');
        }
        return;
      }

      // Mobile location (Expo Location)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need location permissions to share your location!');
        return;
      }

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
    // Different options for web vs mobile
    const options = Platform.OS === 'web' 
      ? ['Choose From Library', 'Send Location', 'Cancel']
      : ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    
    const cancelButtonIndex = options.length - 1;
    
    showActionSheetWithOptions(
      { 
        options, 
        cancelButtonIndex,
        title: Platform.OS === 'web' ? 'Communication Features (Web)' : 'Communication Features'
      },
      (buttonIndex) => {
        if (Platform.OS === 'web') {
          switch (buttonIndex) {
            case 0: pickImage(); break;
            case 1: getLocation(); break;
            default: break;
          }
        } else {
          switch (buttonIndex) {
            case 0: pickImage(); break;
            case 1: takePhoto(); break;
            case 2: getLocation(); break;
            default: break;
          }
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
