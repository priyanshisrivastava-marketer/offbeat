# Offbeat — Deploy Guide (Vercel + Firebase + Google APIs)

Offbeat is a Next.js web app that creates spontaneous 2-4 hour local micro-adventures using real places from Google Places and Gemini AI. Authentication and saved user data are handled by Firebase, and the app is hosted on Vercel.

## Stack
- **Firebase Authentication** with Google sign-in
- **Cloud Firestore** for profiles and completed adventures
- **Google Places API** for real local spots
- **Google Gemini API** for itinerary generation
- **Vercel** for hosting

## Environment variables

### Firebase client variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin server variables
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### API keys
- `GOOGLE_PLACES_API_KEY`
- `GEMINI_API_KEY`

For Vercel, add the required variables to every environment where you deploy, including Preview and Production. Never commit the Firebase Admin private key to GitHub.

## Firebase setup

1. Create or open the Firebase project.
2. Enable **Authentication → Sign-in method → Google**.
3. Register the web app and copy its Firebase web configuration into the `NEXT_PUBLIC_FIREBASE_*` variables.
4. Create a Cloud Firestore database.
5. Deploy or apply the rules in `firestore.rules` so users can only access their own profile and completed adventures.
6. Create a Firebase service account key and use its project ID, client email and private key as the server-side `FIREBASE_*` variables in Vercel.
7. Add your Vercel domain to Firebase Authentication's authorized domains if it is not already present.

## Deploy

1. Connect the GitHub repository to Vercel.
2. Add all required environment variables.
3. Make sure Preview and Production have the variables needed for the deployment.
4. Deploy or redeploy the latest commit.

The API routes are explicitly dynamic and run on Node.js so Firebase Admin credentials are only required when an authenticated request reaches the route, not during static page generation.

## Test

1. Open the deployed Offbeat URL.
2. Click **Continue with Google**.
3. Complete the profile setup.
4. Enter a city and choose the time, vibe and companion.
5. Generate an adventure and confirm real places are returned.
6. Mark an adventure as completed and confirm it appears in the Completed tab.
7. Sign out and sign back in to confirm the profile and saved adventures persist.

<!-- Deployment trigger: Firebase Google sign-in UI is implemented in app/page.js. -->
