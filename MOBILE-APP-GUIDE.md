# Offbeat — Mobile App Guide (Android + iOS)

Your web app is already updated with everything needed to become a mobile app (manifest, icons, service worker). This guide has two tiers: one that's live in minutes for free, and one that gets you real listings in the Google Play Store and Apple App Store.

---

## Tier 1: Installable app, live today, completely free

Once you redeploy (just push these updated files to GitHub — Vercel auto-redeploys), your site is already installable as an app on both platforms, no app store needed.

**On Android (Chrome):**
1. Open your site's URL in Chrome
2. Tap the **⋮** menu → **Install app** (or you'll see a banner prompting this automatically)
3. It installs to the home screen with its own icon, opens full-screen, no browser bar

**On iPhone (Safari):**
1. Open your site's URL in Safari
2. Tap the **Share** icon → **Add to Home Screen**
3. It installs the same way — home screen icon, full-screen, works offline for the basic shell

This is genuinely free forever and requires no store review, no developer account, no waiting. Share your Vercel link directly and tell people to "Add to Home Screen" — that's a fully working mobile app experience.

**Limitation:** it won't appear when someone searches "Offbeat" in the App Store or Play Store — people need your direct link to install it.

---

## Tier 2: Real App Store + Play Store listings

This is where two unavoidable real-world costs come in — not from me, from Apple and Google directly:
- **Google Play Console:** $25 one-time registration fee
- **Apple Developer Program:** $99/year

There's no way around these if you want to appear in the actual stores — this is Apple/Google policy for every developer, no-code or not.

### Step 1: Turn your web app into store-ready packages (no-code)

1. Go to https://www.pwabuilder.com (free, official Microsoft-backed tool)
2. Paste your live Vercel URL into the box, click **Start**
3. It scans your site (it'll detect the manifest and service worker you already have) and shows a readiness score
4. Click **Package for stores**
5. Choose **Android** → download the generated Android package (`.aab` file) — no coding involved, it's auto-generated from your site
6. Choose **iOS** → download the generated Xcode project — this one needs a Mac to build (see Step 3)

### Step 2: Publish to Google Play (Android)

1. Go to https://play.google.com/console and sign up ($25 one-time fee, pay by card)
2. Click **Create app**, fill in the basic listing (name: Offbeat, description, screenshots — you can screenshot your own phone using the installed PWA)
3. Go to **Production → Create new release**, upload the `.aab` file from PWABuilder
4. Fill out the required content rating questionnaire and privacy policy link (a simple one-page privacy policy is required — even a basic one stating what data you collect via Supabase is enough)
5. Submit for review — typically takes a few hours to a couple of days

### Step 3: Publish to the App Store (iOS)

This one genuinely requires a Mac at some point — Apple doesn't allow iOS app submission from Windows/Linux.

**If you have access to a Mac (yours, a friend's, or briefly borrowed):**
1. Enroll at https://developer.apple.com/programs ($99/year)
2. Open the Xcode project PWABuilder generated, using Xcode (free from the Mac App Store)
3. Click **Product → Archive**, then follow Xcode's prompts to upload to **App Store Connect**
4. Go to https://appstoreconnect.apple.com, fill in the listing (name, screenshots, description, privacy policy link)
5. Submit for review — typically 1-3 days

**If you don't have access to a Mac at all:**
- Cloud Mac rental services like MacinCloud (~$1/hour or ~$20-30/month) let you do just the Xcode build/upload step remotely, no physical Mac needed
- Alternatively, a paid wrapper service like Median.co (https://median.co) handles the entire iOS build and submission for you, including their own Mac infrastructure — costs more (~$50+/month) but means you truly never touch Xcode

---

## What you actually need to "just connect"

Given everything is already built:
1. Push the updated code (with manifest/icons/service worker) to GitHub — Vercel redeploys automatically
2. Test "Add to Home Screen" on your own phone first — that's your free, instant mobile app
3. When ready for real store listings: go to pwabuilder.com, paste your URL, download the two packages, and follow Steps 2 and 3 above
4. The only things you'll need to personally provide along the way: your Google Play Console account ($25), your Apple Developer account ($99/year) if going the App Store route, and basic app store listing content (description, screenshots, a one-line privacy policy)

---

## Costs summary

| Item | Cost |
|---|---|
| PWA / "Add to Home Screen" (Tier 1) | Free, forever |
| PWABuilder packaging | Free |
| Google Play Console | $25 one-time |
| Apple Developer Program | $99/year |
| Cloud Mac rental (if no Mac access) | ~$20-30/month, only while building |
