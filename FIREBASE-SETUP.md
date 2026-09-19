# Offbeat Firebase setup

The `firebase-migration` branch replaces Supabase Auth/database usage with Firebase Authentication + Firestore.

## 1. Create the Firebase project

1. Open https://console.firebase.google.com/
2. Create a project named `Offbeat`.
3. Open **Authentication → Sign-in method → Google** and enable Google.
4. Open **Firestore Database → Create database** and choose Production mode.
5. In **Project settings → General → Your apps**, add a Web app and copy its Firebase config values.

## 2. Add the web environment variables

Add these to Vercel and local `.env.local`:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 3. Create the Firebase Admin service account

In Firebase Console go to **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**.

Use the downloaded JSON to populate these server-only Vercel variables:

```text
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Do not commit the JSON file or the private key to GitHub.

## 4. Deploy Firestore rules

The repository contains `firestore.rules`. Publish those rules in Firebase Console or with the Firebase CLI.

## 5. Configure authorized domains

In **Authentication → Settings → Authorized domains**, make sure your Vercel production domain is listed. Add your local development host if Firebase asks for it.

## 6. Test

- Open Offbeat.
- Click **Continue with Google**.
- Complete the profile name step.
- Generate an adventure.
- Click **I went! Mark as completed**.
- Open **Completed** and confirm the adventure is saved.
- Refresh the page and confirm the session remains signed in.

## Firestore structure

```text
users/{uid}
  name
  email
  photoURL
  defaultCity
  favoriteVibe
  favoriteCompanion

users/{uid}/completed_adventures/{autoId}
  title
  city
  vibe
  companion
  stops
  completedAt
```

Supabase is intentionally not deleted until the Firebase version has been tested in production.
