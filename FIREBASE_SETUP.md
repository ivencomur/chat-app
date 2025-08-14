# í´¥ Firebase Setup for Exercise 5.3

## Required Firebase Configuration

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name: "ChatApp" (or your choice)
4. **DISABLE Google Analytics** (not needed for exercise)
5. Click "Create project"

### 2. Setup Firestore Database
1. Firebase Console â†’ **Build** â†’ **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (per exercise instructions)
4. Select location closest to you
5. Click **"Enable"**

### 3. Configure Database Rules (CRITICAL!)
1. Go to **Rules** tab in Firestore
2. Replace rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

### 4. Enable Anonymous Authentication
1. Go to **Authentication** â†’ **Sign-in method**
2. Click **"Anonymous"**
3. Toggle **"Enable"**
4. Click **"Save"**

### 5. Get Your Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"**
3. Click web icon `</>`
4. Register app name: "ChatApp"
5. **COPY the firebaseConfig object**
6. **PASTE into App.js** (replace the placeholder config)

## Next Steps
1. Follow the setup instructions above
2. Copy your Firebase config to App.js
3. Run: npm start
4. Test anonymous authentication and real-time messaging
