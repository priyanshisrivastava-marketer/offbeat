# Offbeat — Mobile App Guide (Android + iOS)

Your web app already includes the manifest, icons and service worker needed to work as an installable PWA.

## Tier 1: Installable app, live today

After the latest GitHub commit is deployed by Vercel, the site can be installed directly without an app store.

**Android (Chrome):**
1. Open your site's URL.
2. Tap **⋮ → Install app**.

**iPhone (Safari):**
1. Open your site's URL.
2. Tap **Share → Add to Home Screen**.

## Tier 2: App Store + Play Store

If you later want store listings:

- **Google Play Console:** $25 one-time registration fee.
- **Apple Developer Program:** $99/year.

### Package the PWA

1. Open https://www.pwabuilder.com
2. Paste the live Vercel URL.
3. Click **Start**.
4. Use **Package for stores** to generate the Android and iOS packages.

### Privacy policy

Your privacy policy should accurately describe the data the app stores in Firebase, including the Google account profile information and completed adventures associated with the signed-in user.

## What you need to deploy

1. Push the latest code to GitHub.
2. Let Vercel redeploy it.
3. Test **Add to Home Screen** on your phone.
4. When ready for store listings, use PWABuilder and follow the platform submission steps.
