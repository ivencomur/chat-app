#!/bin/bash

echo "í·ª Testing Firebase Setup for Exercise 5.3"
echo "==========================================="

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if Firebase config is updated
print_status "Checking Firebase configuration..."
if grep -q "your-api-key-here" App.js; then
    print_error "Firebase config not updated in App.js"
    echo "Please add your actual Firebase configuration to App.js"
    exit 1
else
    print_success "Firebase config appears to be updated"
fi

# Check required files exist
FILES=("App.js" "components/Start.js" "components/Chat.js")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
        exit 1
    fi
done

# Check Firebase dependency
if npm list firebase@10.3.1 &> /dev/null; then
    print_success "Firebase SDK v10.3.1 installed"
else
    print_error "Firebase SDK v10.3.1 not found"
    echo "Run: npm install firebase@10.3.1"
    exit 1
fi

# Check Gifted Chat dependency
if npm list react-native-gifted-chat &> /dev/null; then
    print_success "Gifted Chat installed"
else
    print_error "Gifted Chat not found"
    echo "Run: npm install react-native-gifted-chat"
    exit 1
fi

print_status "All checks passed! Ready to test Exercise 5.3"
echo ""
echo "Next steps:"
echo "1. Update Firebase config in App.js with your actual values"
echo "2. Run: npx expo start --clear"
echo "3. Test anonymous authentication and real-time messaging"
