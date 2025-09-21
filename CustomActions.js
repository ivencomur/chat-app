import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Helper function to convert file URI to Base64 for web
const uriToDataURL = (uri) => {
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

const CustomActions = ({ onSend, userID }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to share photos!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        let imageUri = result.assets[0].uri;

        // On web, convert the local file URI to a Base64 Data URL so it can be displayed.
        if (Platform.OS === 'web') {
          imageUri = await uriToDataURL(imageUri);
        }

        onSend([{
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userID },
          image: imageUri,
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
      if (Platform.OS === 'web') {
        Alert.alert(
          'Web Limitation', 
          'Camera capture is not available on web. Please use "Choose From Library" instead.'
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
        return;
      }

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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need location permissions to share your location!');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
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
    const options = Platform.OS === 'web' 
      ? ['Choose From Library', 'Send Location', 'Cancel']
      : ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    
    const cancelButtonIndex = options.length - 1;
    
    showActionSheetWithOptions(
      { 
        options, 
        cancelButtonIndex,
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
