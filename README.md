# Offbeat — Deploy Guide (Vercel + Google Places API)

This is a real Next.js website (not a no-code builder project). It uses:
- **Google Gemini API** (free, no card) to generate the adventure
- **Google Places API via a no-card Demo Key** to pull real, currently-open local spots
- **Supabase** (free, no card) for user accounts and saved data
- **Vercel** (free, no card) to host it live

You won't need to write any code — just follow these steps and paste in the keys.

---

## Step 1: Get your Google Places key (no card required)

This uses Google's official **Maps Demo Key** — built specifically for prototyping, with zero billing account or card required.

1. Go to https://mapsplatform.google.com/maps-demo-key/
2. Click through to generate a demo key (Google sign-in only, no card prompt)
3. Copy the key — this is your `GOOGLE_PLACES_API_KEY`
4. Note the trade-off: demo keys have a **daily usage limit**, reset every 24 hours. Fine for building, testing, and even a modest early launch. If you outgrow it later, you can upgrade the same key to a billing-enabled one without changing any code.

---

## Step 2: Get your Gemini API key (no card required)

This replaces Anthropic in this version specifically because Gemini's free tier requires no card at all.

1. Go to https://aistudio.google.com/apikey
2. Sign in with the same Google account
3. Click **Create API key** → copy it — this is your `GEMINI_API_KEY`
4. Free tier limits: roughly 15 requests/minute, which is plenty for personal use and early testers. No card, no expiring trial — it's a genuinely ongoing free tier.

---

## Step 3: Set up Supabase (user accounts + saved profile + Completed adventures)

1. Go to https://supabase.com and sign in (GitHub sign-in is easiest)
2. Click **New Project** → name it "offbeat" → set a database password (save it somewhere) → choose a region close to your users → Create
3. Wait ~2 minutes for the project to spin up
4. Go to **Project Settings → API** (left sidebar, gear icon → API)
5. Copy the **Project URL** — this is your `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon public** key — this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Go to **SQL Editor** (left sidebar) → **New Query**
8. Open the `supabase-setup.sql` file included in this project, paste its entire contents into the SQL editor, click **Run**
   - This creates two tables: `profiles` (name, default city, favorite vibe/companion) and `completed_adventures` (saved history), both locked down so each user can only ever see their own data
9. Go to **Authentication → Providers** and confirm **Email** is enabled (it is by default)
10. Optional but recommended: go to **Authentication → Settings** and turn off "Confirm email" while testing, so you don't need to click an email link every time you sign up a test account. Turn it back on before real users sign up.

---

## Step 4: Get the code onto GitHub

1. Go to https://github.com/new
2. Name the repository "offbeat" → Create repository (keep it empty, no README)
3. On your computer, download all the files from this project folder
4. Follow GitHub's "push an existing folder" instructions shown on that empty repo page, which will look like:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/offbeat.git
   git push -u origin main
   ```
   (If you've never used git before, GitHub Desktop — https://desktop.github.com — gives you the same result with buttons instead of commands.)

---

## Step 5: Deploy to Vercel

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **Add New → Project**
3. Select your "offbeat" repository → **Import**
4. Before clicking Deploy, expand **Environment Variables** and add all four:
   - `GEMINI_API_KEY` → your Gemini key
   - `GOOGLE_PLACES_API_KEY` → your Google demo key
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**
6. Wait ~1 minute — Vercel will give you a live URL like `offbeat-yourname.vercel.app`

Your site is now live with real data and real accounts.

---

## Step 6: Test it

1. Open your live URL
2. Sign up with a test email and password
3. Enter your name when prompted (this is your profile)
4. Enter a city, pick a time/vibe/companion, tap "Surprise me"
5. Confirm real place names show up
6. Tap "I went! Mark as completed" then check the "Completed" tab shows it
7. Sign out and back in — confirm your name and last-used city/vibe/companion are remembered

---

## Step 7: (Optional) Custom domain

1. Buy a domain from any registrar (Namecheap, Google Domains, etc.)
2. In your Vercel project → **Settings → Domains** → add your domain
3. Follow Vercel's instructions to update your domain's DNS records — takes a few minutes to a few hours to propagate

---

## What's next

- **Costs to expect:** with this stack — Vercel, Supabase, Google Demo Key, Gemini free tier — you can build, test, and run this for real users at **zero cost and zero card on file, anywhere**.
- **The honest trade-offs of going fully free:** the Google Demo Key has a daily request cap (resets every 24 hours) — fine for testing and a modest launch, but if the app gets real traffic you'll eventually want to upgrade to a billing-enabled Places key. Gemini's free tier is rate-limited (~15 requests/minute) — if many people use the app at the exact same moment, some requests could get throttled; you'd see this as an error message rather than a silent failure. Neither of these is a "you'll get surprise charged" risk — they're "you'll hit a wall and know exactly why" limits, which is the right trade for zero financial commitment.
- **Adding payments** (a paid tier for unlimited adventures) would be the natural next step once you have real users and want to remove those caps — Stripe integrates cleanly with this same stack, and that revenue is what would justify adding a card to the Google/Gemini side too.
