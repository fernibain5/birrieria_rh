# Firebase Authentication & User Setup Guide

## 1. Enable Authentication in Firebase Console

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `birrieria-la-purisima`
3. In the left sidebar, click on **Authentication**
4. Click on the **Get started** button
5. Go to the **Sign-in method** tab
6. Enable **Email/Password** authentication
7. Click **Save**

## 2. Enable Firestore Database

1. In your Firebase Console, click on **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you can change security rules later)
4. Select your preferred location (closest to your users)
5. Click **Done**

## 3. Create User Accounts

### Option A: Create Users via Firebase Console (Recommended)

1. Go to **Authentication** > **Users** tab
2. Click **Add user**
3. Create your admin user:
   - Email: `admin@birrieria.com` (or your preferred admin email)
   - Password: Create a secure password
4. Create your regular user:
   - Email: `user@birrieria.com` (or your preferred user email)
   - Password: Create a secure password

### Option B: Users can register through your app

- Add registration functionality to your login page
- Users can create accounts using the "Crear cuenta" button

## 4. Set User Roles in Firestore

After creating users, you need to set their roles in Firestore:

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `users`
4. For each user, create a document:

### Admin User Document:

- Document ID: `[user-uid-from-authentication]` (copy from Authentication > Users)
- Fields:
  ```
  role: "admin" (string)
  displayName: "Administrador" (string) [optional]
  ```

### Regular User Document:

- Document ID: `[user-uid-from-authentication]` (copy from Authentication > Users)
- Fields:
  ```
  role: "user" (string)
  displayName: "Usuario Regular" (string) [optional]
  ```

## 5. Test Your Authentication

1. Start your development server: `npm run dev`
2. Try logging in with both accounts
3. Verify that:
   - Admin user can see the **Checador** tab
   - Admin user can add/edit events in the calendar
   - Regular user cannot see the **Checador** tab
   - Regular user can only view events (read-only mode)

## 6. Security Rules (Optional - for production)

Update your Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Only authenticated users can read events
    // Only admin users can write events
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

## Troubleshooting

If you encounter any issues:

1. **"User not found" error**: Make sure you've created the user in Firebase Authentication
2. **User shows as regular user when should be admin**: Check that the user document in Firestore has the correct role
3. **Authentication not working**: Verify that your Firebase configuration is correct in `src/firebase/config.ts`
4. **Firestore permission errors**: Make sure Firestore is in test mode or security rules allow access

## Production Deployment Notes

When deploying to production:

1. Update Firestore security rules to be more restrictive
2. Set up proper environment variables for Firebase config
3. Consider implementing password reset functionality
4. Add proper error handling and logging
