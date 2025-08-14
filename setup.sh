#!/bin/bash

echo "🚀 Starting Complete Expo Chat App Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

print_status "Step 1: Stopping all running processes..."
# Kill any running Metro bundler or Expo processes
pkill -f "metro" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "react-native" 2>/dev/null || true

# Kill processes on common Expo ports
lsof -ti:19000,19001,19002,8081 | xargs kill -9 2>/dev/null || true

print_success "All processes stopped"

print_status "Step 2: Deep cleaning project cache..."
# Remove all cache and temporary files
rm -rf node_modules/
rm -rf .expo/
rm -rf .metro-cache/
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
rm -rf /tmp/react-*

# Clear npm cache
print_status "Clearing npm cache..."
npm cache clean --force

# Clear yarn cache if yarn.lock exists
if [ -f "yarn.lock" ]; then
    print_status "Clearing yarn cache..."
    yarn cache clean
fi

print_success "Project cache cleared"

print_status "Step 3: Clearing system caches..."
# Clear Watchman if available
if command -v watchman &> /dev/null; then
    print_status "Clearing Watchman cache..."
    watchman watch-del-all 2>/dev/null || true
    watchman shutdown-server 2>/dev/null || true
    print_success "Watchman cache cleared"
else
    print_warning "Watchman not found - skipping"
fi

# Clear React Native cache if available
if command -v react-native &> /dev/null; then
    print_status "Clearing React Native cache..."
    npx react-native start --reset-cache &
    sleep 2
    pkill -f "react-native" 2>/dev/null || true
fi

print_status "Step 4: Installing/updating Expo CLI..."
# Install latest Expo CLI
npm install -g @expo/cli@latest

print_status "Step 5: Installing project dependencies..."
# Install dependencies with exact versions
npm install --exact

print_status "Step 6: Installing Expo dependencies..."
# Install and fix Expo dependencies
npx expo install --fix

print_status "Step 7: Installing specific required packages..."
# Install required packages with compatible versions
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-image-picker expo-location
npx expo install react-native-gifted-chat

print_status "Step 8: Verifying installation..."
# Check if critical packages are installed
if npm list react-native-gifted-chat &> /dev/null; then
    print_success "react-native-gifted-chat installed"
else
    print_error "Failed to install react-native-gifted-chat"
fi

if npm list @react-navigation/native &> /dev/null; then
    print_success "@react-navigation/native installed"
else
    print_error "Failed to install @react-navigation/native"
fi

print_status "Step 9: Creating missing assets directory..."
# Create assets directory if it doesn't exist
mkdir -p assets

# Create placeholder files if they don't exist
if [ ! -f "assets/background-image.png" ]; then
    print_warning "background-image.png not found in assets/"
    print_status "Creating placeholder background image..."
    # You'll need to add your actual background image
    touch assets/background-image.png
fi

if [ ! -f "assets/icon.png" ]; then
    print_warning "icon.png not found in assets/"
    touch assets/icon.png
fi

if [ ! -f "assets/splash.png" ]; then
    print_warning "splash.png not found in assets/"
    touch assets/splash.png
fi

if [ ! -f "assets/adaptive-icon.png" ]; then
    print_warning "adaptive-icon.png not found in assets/"
    touch assets/adaptive-icon.png
fi

if [ ! -f "assets/favicon.png" ]; then
    print_warning "favicon.png not found in assets/"
    touch assets/favicon.png
fi

print_status "Step 10: Final cleanup and preparation..."
# One more cache clear to be sure
npm cache clean --force

print_success "Setup completed successfully!"

echo ""
print_status "Next steps:"
echo "1. 📱 Completely uninstall Expo Go from your device/emulator"
echo "2. 🗑️  Clear all app data and cache for Expo Go"
echo "3. 📲 Reinstall Expo Go from Google Play Store"
echo "4. 🖼️  Add your actual images to the assets/ folder"
echo "5. 🔥 Configure Firebase (optional - app works without it)"
echo ""

print_status "Starting the development server..."
echo "🚀 Running: npx expo start --clear"
echo ""
print_warning "If you see any errors, make sure you've:"
print_warning "- Completely reinstalled Expo Go app"
print_warning "- Added required images to assets/ folder"
print_warning "- Have a stable internet connection"
echo ""

# Start the Expo development server with cache clearing
npx expo start --clear