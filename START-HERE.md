# Offbeat — The One Guide (Start to Finish)

Use only this document from here on. Everything below is one linear path — follow it top to bottom. (The other files in the project — README.md, MOBILE-APP-GUIDE.md — cover the same ground in more detail if you ever want to double-check a step, but you don't need them to get through this.)

**What you're building:** Offbeat, an app that generates a spontaneous 2-4 hour local micro-adventure based on your city, time, vibe, and who you're with — using real places (via Google) and AI (via Gemini), with accounts so people can save their profile and past adventures (via Supabase), hosted live (via Vercel), installable on phones (as a PWA), and optionally listed in real app stores.

**Total cost to build and run this: $0, no card required anywhere** — until you optionally want real App Store/Play Store listings later, which have fixed fees from Apple/Google themselves.

---

## Phase 1 — Get your three free API keys

You need three keys. None require a credit card.

### 1. Google Places key (for real local spots)
1. Go to https://mapsplatform.google.com/maps-demo-key/
2. Generate a demo key (just Google sign-in, no card)
3. Save it somewhere — call it `GOOGLE_PLACES_API_KEY`

### 2. Gemini key (the AI that builds the adventure)
1. Go to https://aistudio.google.com/apikey
2. Sign in with the same Google account → **Create API key**
3. Save it — call it `GEMINI_API_KEY`

### 3. Supabase project (accounts + saved data)
1. Go to https://supabase.com → sign in with GitHub → **New Project**
2. Name it "offbeat", set a database password (save it), pick a nearby region → Create (takes ~2 min to spin up)
3. Go to **Project Settings → API** → copy the **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and the **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Go to **SQL Editor → New Query**, open the `supabase-setup.sql` file from this project, paste its full contents in, click **Run** — this creates your two data tables safely (each user can only ever see their own data)
5. Go to **Authentication → Settings** and turn off "Confirm email" for now, so test sign-ups don't need an email click (turn it back on before real users arrive)

You now have 4 values saved: `GOOGLE_PLACES_API_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Phase 2 — Get the code onto GitHub

1. Go to https://github.com/new → name it "offbeat" → **Create repository** (leave it empty)
2. Unzip the project folder I gave you on your computer
3. On the empty repo's page, GitHub shows you commands like this — run them in order from inside the unzipped folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/offbeat.git
   git push -u origin main
   ```
4. Never used git before? Install **GitHub Desktop** (https://desktop.github.com) instead — it does the same thing with buttons, no typed commands.

---

## Phase 3 — Deploy to Vercel (this makes it live)

1. Go to https://vercel.com → sign in with GitHub
2. **Add New → Project** → select your "offbeat" repo → **Import**
3. Before clicking Deploy, open **Environment Variables** and paste in all four keys from Phase 1:
   - `GEMINI_API_KEY`
   - `GOOGLE_PLACES_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** → wait ~1 minute → you get a live link like `offbeat-yourname.vercel.app`

**This link is your actual live app.** Everything from here just extends what happens with this link.

---

## Phase 4 — Test it

1. Open your live link
2. Sign up with a test email + password
3. Enter your name when asked
4. Pick a city, time, vibe, companion → tap "Surprise me"
5. Confirm real place names appear
6. Tap "I went! Mark as completed" → check the "Completed" tab shows it
7. Sign out, sign back in → confirm your name and preferences are remembered

If anything errors, the message shown will tell you which key is missing or wrong — check Phase 1 and Phase 3 first.

---

## Phase 5 — Make it a mobile app (already built in — free)

Your project already includes everything needed (manifest, icons, offline support). No extra step needed beyond Phase 3 — as soon as it's deployed:

**On Android:** open the link in Chrome → tap **⋮ → Install app**
**On iPhone:** open the link in Safari → tap **Share → Add to Home Screen**

That's a real installable app icon, full-screen, no browser bar — live and free, right now. Share the link and tell people to do this.

---

## Phase 6 — Optional: real App Store / Play Store listing

Only do this once Phase 1-5 feel solid and you want the app discoverable by searching in the stores (not just via your link). This has two real, fixed costs — from Apple and Google, not from anything we've built:

- **Google Play:** $25 one-time
- **Apple App Store:** $99/year (also requires a Mac at one step — rentable via cloud Mac services like MacinCloud if you don't have one)

**Steps:**
1. Go to https://www.pwabuilder.com → paste your live Vercel link → **Start**
2. Click **Package for stores** → download the Android package and the iOS Xcode project
3. **Android:** sign up at https://play.google.com/console ($25) → create app → upload the Android package → fill listing → submit
4. **iOS:** enroll at https://developer.apple.com/programs ($99/yr) → open the Xcode project on a Mac → Product → Archive → upload to App Store Connect → fill listing → submit

---

## If you only remember one thing

**Phase 1 (get 3 keys) → Phase 2 (GitHub) → Phase 3 (Vercel deploy) → Phase 4 (test) → done.** Everything else is optional polish on top of a working, live, free app.
