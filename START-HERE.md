# Offbeat — The One Guide (Start to Finish)

Offbeat generates spontaneous 2-4 hour local micro-adventures using real places from Google and Gemini AI. Firebase handles Google sign-in and saved data, Vercel hosts the app, and the project is installable as a PWA.

## Phase 1 — Configure Firebase

1. Open your Firebase project.
2. Go to **Authentication → Sign-in method** and enable **Google**.
3. Register the web app and copy its Firebase configuration into these Vercel variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Create a Cloud Firestore database.
5. Apply the rules in `firestore.rules`.
6. Create a Firebase service account for the server and add:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

Never put the Admin private key in GitHub.

## Phase 2 — Add Google API keys

Add these Vercel server variables:
- `GOOGLE_PLACES_API_KEY`
- `GEMINI_API_KEY`

## Phase 3 — Deploy to Vercel

1. Connect the `offbeat` GitHub repository to Vercel.
2. Add all Firebase and Google environment variables.
3. Enable the variables for both **Preview** and **Production** environments when both are used.
4. Deploy or redeploy the latest commit.

The API routes are forced to run dynamically on Node.js. Firebase Admin credentials are therefore needed at request time, not during static page generation.

## Phase 4 — Test

1. Open the live Vercel URL.
2. Click **Continue with Google**.
3. Complete the profile setup.
4. Choose a city, time, vibe and companion.
5. Generate an adventure.
6. Mark it completed and verify it appears under **Completed**.
7. Sign out and sign back in to verify saved profile data and adventure history.

## Phase 5 — Install as a mobile app

The project already includes the manifest, icons and service worker.

- **Android:** open the Vercel URL in Chrome → **Install app**.
- **iPhone:** open the URL in Safari → **Share → Add to Home Screen**.

## If deployment fails

Check the Vercel build log for the first actual error, not the final `npm run build exited with 1` line. For Firebase Admin errors, confirm the three `FIREBASE_*` server variables exist in the environment being deployed.
