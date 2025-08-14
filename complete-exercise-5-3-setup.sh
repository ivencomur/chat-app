#!/bin/bash

echo "í¾¯ Exercise 5.3: Complete Cross-Platform Setup"
echo "=============================================="

npm install firebase@10.3.1 --save
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npm install react-native-gifted-chat@^2.4.0
npm install --save-dev @expo/webpack-config

echo "âœ… Setup complete! Run: npx expo start --clear"
