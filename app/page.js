"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebaseClient";
import styles from "./page.module.css";

const DURATIONS = ["1–2 hours", "3–4 hours", "Half day", "Full day"];
const DISTANCE_MIN = 1;
const DISTANCE_MAX = 30;
const DISTANCE_DEFAULT = 5;

const VIBES = [
  { label: "Food", icon: "🍜" },
  { label: "Chill", icon: "🌿" },
  { label: "Social", icon: "🎉" },
  { label: "Adventurous", icon: "🧭" },
  { label: "Creative", icon: "🎨" },
  { label: "Shopping", icon: "🛍️" },
];

const COMPANIONS = [
  { label: "Solo", icon: "🚶" },
  { label: "Friends group", icon: "👯" },
  { label: "Partner", icon: "💞" },
  { label: "Family", icon: "👨‍👩‍👧" },
];

const HEROES = [
  { type: "video", src: "/landing/hero-1.mp4", position: "50% 45%", kicker: "Start wandering", title: "Find your next adventure.", text: "A little time. A little curiosity. One offbeat place." },
  { type: "image", src: "/landing/IMG_6049.jpg", position: "50% 42%", kicker: "Go somewhere unexpected", title: "Go somewhere unexpected.", text: "Discover places worth stepping away for." },
  { type: "video", src: "/landing/IMG_5195.mp4", position: "50% 42%", kicker: "Take the scenic route", title: "Take the scenic route.", text: "Culture, stories and places hiding in plain sight." },
  { type: "image", src: "/landing/himalayan-art.jpg", position: "50% 40%", kicker: "Make time", title: "Make a few hours count.", text: "Turn spare time into a tiny adventure." },
  { type: "video", src: "/landing/IMG_6595.mp4", position: "55% 43%", kicker: "Escape for a while", title: "Escape, even for a while.", text: "Find your kind of offbeat." },
  { type: "image", src: "/landing/temple.jpg", position: "50% 43%", kicker: "Slow down", title: "Step off the usual path.", text: "There's always somewhere new to explore." },
  { type: "image", src: "/landing/beach-wide.jpg", position: "50% 50%", kicker: "Get out", title: "Your adventure is closer than you think.", text: "Explore without needing a whole day." },
  { type: "image", src: "/landing/beach-shell.jpg", position: "50% 45%", kicker: "Small moments", title: "Slow down. Look around.", text: "Find something different." },
  { type: "image", src: "/landing/himalayan-view.jpg", position: "50% 40%", kicker: "Go offbeat", title: "Leave the ordinary behind.", text: "Explore nearby places you might never have thought to visit." },
];

function ticketCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function encodeAdventure(adventure, meta) {
  const payload = { ...adventure, ...meta, stops: adventure?.stops || [] };
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
}

async function apiFetch(path, user, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeout || 30000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const { timeout: _timeout, ...fetchOptions } = options;
  const headers = { "Content-Type": "application/json", ...(fetchOptions.headers || {}) };

  try {
    if (user) {
      try {
        const token = await Promise.race([
          user.getIdToken(),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error("token-timeout")), 5000)),
        ]);
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (tokenError) {
        console.warn("Offbeat could not get a Firebase ID token:", tokenError);
      }
    }

    const response = await fetch(path, { ...fetchOptions, headers, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("This is taking longer than expected. Please try again.");
    if (error instanceof TypeError) throw new Error("Could not connect to Offbeat. Please check your connection and try again.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function Logo({ small = false }) {
  return <img className={small ? styles.miniBrand : styles.brand} src="/brand/offbeat-mark.png" alt="Offbeat" onError={(event) => { event.currentTarget.style.display = "none"; }} />;
}

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 19-9 19-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.1 26.9 36 24 36c-5.2 0-9.5-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.9 5.4-7.3 6.6l6.3 5.2C38 36.6 43 31 43 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GoogleButton({ onError }) {
  const [loading, setLoading] = useState(false);
  const login = async () => {
    setLoading(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (error) { onError?.(error?.message || "Google sign-in failed. Please try again."); }
    finally { setLoading(false); }
  };
  return <button className={styles.primary} onClick={login} disabled={loading} type="button"><GoogleIcon /><span>{loading ? "Opening Google…" : "Continue with Google"}</span></button>;
}

function HeroMedia({ hero, className, onError }) {
  const style = { objectFit: "cover", objectPosition: hero.position || "50% 50%", width: "100%", height: "100%" };
  if (hero.type === "video") return <video className={className} src={hero.src} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onError={onError} style={style} />;
  return <img className={className} src={hero.src} alt="" draggable="false" onError={onError} style={style} />;
}

function CuriousPanel({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div className={styles.aboutOverlay} role="dialog" aria-modal="true" aria-labelledby="curious-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className={styles.aboutPanel}>
        <button className={styles.aboutClose} onClick={onClose} type="button" aria-label="Close">×</button>
        <span className={styles.aboutKicker}>For curious people</span>
        <h2 id="curious-title" className={styles.aboutTitle}>Explore more. Plan less.</h2>
        <div className={styles.aboutSection}><span className={styles.aboutLabel}>About Offbeat</span><p>Offbeat is for people who want to discover new places, try something different and make the most of the time they have, without spending hours planning every little detail.</p></div>
        <div className={styles.aboutSection}><span className={styles.aboutLabel}>Why I&apos;m building it</span><p>I want to build a community of people who want to explore without spending hours in planning and executing. Sometimes you do not need a whole itinerary. You just need a few hours, a little curiosity and a reason to step out.</p></div>
        <div className={styles.aboutSection}><span className={styles.aboutLabel}>About me</span><p>I&apos;m Priyanshi, a marketer and builder who loves turning ideas into useful little experiences. Offbeat started from a simple thought: everyday life has more room for adventure than we think.</p></div>
        <a className={styles.portfolioLink} href="https://priyanshisrivastava-marketer.github.io/" target="_blank" rel="noopener noreferrer"><span>View my portfolio</span><span>↗</span></a>
        <div className={styles.aboutSignoff}><strong>Happy exploring ✨</strong><span>See you somewhere offbeat.</span></div>
      </aside>
    </div>
  );
}

function Landing({ onGuest }) {
  const [slide, setSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showCurious, setShowCurious] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => { const next = (current + 1) % HEROES.length; setPreviousSlide(current); setIsTransitioning(true); window.setTimeout(() => { setPreviousSlide(null); setIsTransitioning(false); }, 950); return next; });
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);
  const changeSlide = (nextSlide) => { if (nextSlide === slide || isTransitioning) return; setPreviousSlide(slide); setSlide(nextSlide); setIsTransitioning(true); window.setTimeout(() => { setPreviousSlide(null); setIsTransitioning(false); }, 950); };
  const hero = HEROES[slide];
  const previousHero = previousSlide !== null ? HEROES[previousSlide] : null;
  const handleMediaError = (event) => { event.currentTarget.style.opacity = "0"; };
  return (
    <main className={styles.landing}><div className={styles.landingInner}>
      <div className={styles.topbar}><Logo /><button className={styles.topLink} onClick={() => setShowCurious(true)} type="button">For curious people</button></div>
      <section className={styles.hero} aria-label="Offbeat travel inspiration">
        <div className={styles.heroMedia}>{previousHero && <HeroMedia hero={previousHero} className={`${styles.heroImage} ${styles.heroImagePrevious}`} onError={handleMediaError} />}<HeroMedia hero={hero} className={`${styles.heroImage} ${styles.heroImageCurrent}`} onError={handleMediaError} /></div>
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}><span className={styles.eyebrow}>✦ {hero.kicker}</span><h1 className={styles.heroTitle}>{hero.title}</h1><p className={styles.heroText}>{hero.text}</p><div className={styles.dots}>{HEROES.map((item, index) => <button key={item.src} type="button" className={`${styles.dot} ${index === slide ? styles.dotActive : ""}`} onClick={() => changeSlide(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === slide ? "true" : undefined} disabled={isTransitioning} />)}</div></div>
      </section>
      <div className={styles.walk} aria-hidden="true"><span className={styles.walkStep}>👟</span><span className={styles.walkStep}>👟</span><span className={styles.walkStep}>👟</span><span className={styles.walkStep}>👟</span><span className={styles.walkLine} /><span>take the next step</span></div>
      <div className={styles.ctaRow}><GoogleButton onError={setAuthError} /><button className={styles.secondary} onClick={onGuest} type="button">Explore without signing in</button></div>
      {authError && <p className={styles.error}>{authError}</p>}
      <p className={styles.trust}>🔒 Your sign-in is only used to save your profile and adventures. Guest mode does not save anything.</p>
      {showCurious && <CuriousPanel onClose={() => setShowCurious(false)} />}
    </div></main>
  );
}

function AuthGate({ user, onDone }) {
  const [name, setName] = useState(user.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setLoading(true);
    setError("");
    const nextProfile = { name: cleanName, email: user.email || "", photoURL: user.photoURL || "" };
    try { window.localStorage.setItem(`offbeat-profile-${user.uid}`, JSON.stringify(nextProfile)); } catch {}
    onDone(nextProfile);
    try {
      await apiFetch("/api/profile", user, { method: "POST", body: JSON.stringify({ name: cleanName }), timeout: 8000 });
    } catch (err) {
      console.warn("Could not sync profile to the server:", err);
    } finally {
      setLoading(false);
    }
  };
  return <main className={styles.authCard}><div className={styles.authInner}><Logo /><p className={styles.hello}>One tiny detail before you go.</p><div className={styles.panel}><label className={styles.label} htmlFor="name">What should Offbeat call you?</label><input id="name" className={`${styles.input} ${styles.profileInput}`} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") save(); }} placeholder="e.g. Priya" autoFocus /><button className={styles.generate} onClick={save} disabled={loading} type="button">{loading ? "Saving..." : "Let's go"}</button>{error && <p className={styles.error}>{error}</p>}</div></div></main>;
}

function CompletedTab({ user, refreshKey }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; setLoading(true); setError(""); apiFetch("/api/completed", user).then((data) => { if (active) setItems(data.items || []); }).catch((err) => { if (active) setError(err?.message || "Could not load completed adventures."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user, refreshKey]);
  if (loading) return <div className={styles.empty}>Loading your adventures...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!items.length) return <div className={styles.empty}>🗺️<br />No adventures completed yet.</div>;
  return <div>{items.map((adventure) => <article className={styles.ticket} key={adventure.id}><div className={styles.ticketTop}><div className={styles.ticketCode}>COMPLETED · {adventure.city}</div><h2 className={styles.ticketTitle}>{adventure.title}</h2></div><div className={styles.stops}>{(adventure.stops || []).map((stop, index) => <div className={styles.stop} key={`${stop.name}-${index}`}><span className={styles.stopNum}>{index + 1}</span><strong>{stop.name}</strong><br /><a className={styles.map} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${adventure.city}`)}`} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a></div>)}</div></article>)}</div>;
}

function Generator({ user, profile, onLogout }) {
  const [tab, setTab] = useState("new");
  const [city, setCity] = useState(profile?.defaultCity || "");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [distance, setDistance] = useState(profile?.preferredDistance || DISTANCE_DEFAULT);
  const [vibe, setVibe] = useState(profile?.favoriteVibe || VIBES[0].label);
  const [companion, setCompanion] = useState(profile?.favoriteCompanion || COMPANIONS[0].label);
  const [adventure, setAdventure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const [completedRefresh, setCompletedRefresh] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const code = useMemo(ticketCode, []);

  const locateMe = () => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Location is not supported by this browser."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&zoom=10&addressdetails=1`, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Could not find your city.");
        const data = await response.json(); const address = data.address || {};
        const detectedCity = address.city || address.town || address.village || address.municipality || address.county;
        if (!detectedCity) throw new Error("Could not identify your city from this location.");
        setCity(detectedCity);
      } catch (err) { setLocationError(err?.message || "Could not identify your location. You can enter your city manually."); }
      finally { setLocating(false); }
    }, (error) => {
      const message = error?.code === 1 ? "Location permission was denied. You can enter your city manually." : error?.code === 2 ? "Your location could not be determined. Please try again or enter your city manually." : "Location took too long. Please try again.";
      setLocationError(message); setLocating(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  const generate = async () => {
    if (!city.trim()) { setErrorMsg("Enter a city or use Locate me first."); return; }
    setLoading(true); setErrorMsg(""); setAdventure(null); setJustCompleted(false); setShareStatus("");
    try {
      const placesData = await apiFetch("/api/places", user, { method: "POST", body: JSON.stringify({ city: city.trim(), vibe, distance }) });
      if (!placesData.places?.length) throw new Error(`I couldn't find suitable ${vibe.toLowerCase()} places in ${city}. Try a nearby city or a larger distance.`);
      const advData = await apiFetch("/api/adventure", user, { method: "POST", body: JSON.stringify({ city: city.trim(), duration, distance, vibe, companion, places: placesData.places }) });
      setAdventure(advData.adventure);
      if (user) {
        try { await apiFetch("/api/profile", user, { method: "POST", body: JSON.stringify({ name: profile?.name || user.displayName || "", defaultCity: city.trim(), favoriteVibe: vibe, favoriteCompanion: companion, preferredDistance: distance }) }); }
        catch (err) { console.warn("Could not sync preferences", err); }
      }
    } catch (err) { setErrorMsg(err?.message || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const markCompleted = async () => {
    if (!user || !adventure || justCompleted) return;
    setErrorMsg("");
    try {
      await apiFetch("/api/completed", user, { method: "POST", body: JSON.stringify({ title: adventure.title, city, vibe, companion, stops: adventure.stops }) });
      setJustCompleted(true); setCompletedRefresh((value) => value + 1);
    } catch (err) { setErrorMsg(err?.message || "Could not save this adventure right now. Please try again."); }
  };

  const shareAdventure = async () => {
    if (!adventure) return;
    setShareStatus("");
    const encoded = encodeAdventure(adventure, { city, vibe, companion, duration, distance });
    const url = `${window.location.origin}/share?a=${encoded}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: adventure.title || "My Offbeat adventure", text: adventure.tagline || "An adventure from Offbeat.", url });
        setShareStatus("Shared ✨");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied ✨");
      }
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus("Could not share. Try again.");
    }
    window.setTimeout(() => setShareStatus(""), 2400);
  };

  const distanceProgress = ((distance - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)) * 100;

  return (
    <main className={styles.generatorWrap}><div className={styles.generator}>
      <header className={styles.appHeader}><Logo small /><div><div className={styles.hello}>{user ? `Hi, ${profile?.name || user.displayName || "there"}` : "Guest mode"}</div>{user && <button className={styles.signout} onClick={onLogout} type="button">Sign out</button>}</div></header>
      {user && <div className={styles.tabs}><button className={`${styles.tab} ${tab === "new" ? styles.tabActive : ""}`} onClick={() => setTab("new")} type="button">New Adventure</button><button className={`${styles.tab} ${tab === "completed" ? styles.tabActive : ""}`} onClick={() => setTab("completed")} type="button">Completed</button></div>}
      {tab === "completed" && user ? <CompletedTab user={user} refreshKey={completedRefresh} /> : <>
        <section className={styles.panel}>
          <span className={styles.eyebrow} style={{ background: "#17191d", color: "#fff" }}>✦ Build a little adventure</span>
          <h1 className={styles.ticketTitle}>Where are you going?</h1>
          <p className={styles.ticketSub}>Give Offbeat a city, a mood and a little time. We will handle the rest.</p>
          <div className={styles.section}>
            <label className={styles.label} htmlFor="city">City</label>
            <div className={styles.locationInputRow}><input id="city" className={styles.input} value={city} onChange={(event) => { setCity(event.target.value); setLocationError(""); }} placeholder="Mumbai, Delhi, Jaipur..." onKeyDown={(event) => { if (event.key === "Enter") generate(); }} /><button className={styles.locateButton} onClick={locateMe} disabled={locating} type="button" aria-label="Use my current location">{locating ? "Locating…" : "📍 Locate me"}</button></div>
            <p className={styles.locationHint}>Use your current location to fill in your city automatically.</p>{locationError && <p className={styles.locationError}>{locationError}</p>}
          </div>
          <div className={styles.section}><span className={styles.label}>Time</span><div className={styles.choiceGrid}>{DURATIONS.map((value) => <button key={value} className={`${styles.choice} ${duration === value ? styles.choiceActive : ""}`} onClick={() => setDuration(value)} type="button">⏱️ {value}</button>)}</div></div>
          <div className={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <span className={styles.label} style={{ marginBottom: 0 }}>How far will you go?</span>
              <strong style={{ fontSize: ".9rem", color: "#17191d", whiteSpace: "nowrap" }}>{distance} km</strong>
            </div>
            <div style={{ padding: "4px 2px 0" }}>
              <input aria-label="Maximum distance" type="range" min={DISTANCE_MIN} max={DISTANCE_MAX} step="1" value={distance} onChange={(event) => setDistance(Number(event.target.value))} style={{ width: "100%", accentColor: "#17191d", cursor: "pointer", background: `linear-gradient(to right, #17191d 0%, #17191d ${distanceProgress}%, #e2ddd4 ${distanceProgress}%, #e2ddd4 100%)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, color: "#8a8f8b", fontSize: ".66rem", fontWeight: 700 }}><span>1 km</span><span>30 km</span></div>
            </div>
            <p style={{ margin: "7px 0 0", color: "#7b817e", fontSize: ".72rem" }}>Keep your adventure within roughly {distance} km.</p>
          </div>
          <div className={styles.section}><span className={styles.label}>Vibe</span><div className={styles.choiceGrid}>{VIBES.map((value) => <button key={value.label} className={`${styles.choice} ${vibe === value.label ? styles.choiceActive : ""}`} onClick={() => setVibe(value.label)} type="button">{value.icon} {value.label}</button>)}</div></div>
          <div className={styles.section}><span className={styles.label}>Who is coming?</span><div className={styles.choiceGrid}>{COMPANIONS.map((value) => <button key={value.label} className={`${styles.choice} ${companion === value.label ? styles.choiceActive : ""}`} onClick={() => setCompanion(value.label)} type="button">{value.icon} {value.label}</button>)}</div></div>
          <button className={styles.generate} onClick={generate} disabled={loading} type="button">{loading ? "Finding your route..." : "Find my Offbeat adventure"}</button>
          <p className={styles.guestNote}>{user ? "Your preferences can be remembered for next time." : "Guest mode is private and unsaved. Sign in only when you want to keep an adventure."}</p>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        </section>
        {adventure && <article className={styles.ticket}>
          <div className={styles.ticketTop}><div className={styles.ticketCode}>BOARDING PASS · #{code}</div><h2 className={styles.ticketTitle}>{adventure.title}</h2><p className={styles.ticketSub}>{adventure.tagline}</p></div>
          <div className={styles.stops}>{(adventure.stops || []).map((stop, index) => <div className={styles.stop} key={`${stop.name}-${index}`}><span className={styles.stopNum}>{index + 1}</span><strong>{stop.name}</strong><div><a className={styles.map} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${city}`)}`} target="_blank" rel="noopener noreferrer">📍 Open in Maps ↗</a></div>{stop.description && <p style={{ margin: "8px 0 0", color: "#707570", fontSize: ".82rem", lineHeight: 1.45 }}>{stop.description}</p>}</div>)}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
              <button className={styles.complete} onClick={shareAdventure} type="button">↗ Share adventure</button>
              {shareStatus && <span style={{ fontSize: ".78rem", color: "#6f756f", fontWeight: 700 }}>{shareStatus}</span>}
              {user ? <button className={styles.complete} onClick={markCompleted} disabled={justCompleted} type="button">{justCompleted ? "✓ Saved to Completed" : "Mark adventure completed"}</button> : <div className={styles.guestSave}>Want to keep this adventure? Sign in with Google and generate it again to save it to your profile.</div>}
            </div>
          </div>
        </article>}
      </>}
    </div></main>
  );
}

export default function Home() {
  const [user, setUser] = useState(undefined);
  const [guest, setGuest] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const fallback = {
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };

    let localProfile = null;
    try {
      const stored = window.localStorage.getItem(`offbeat-profile-${user.uid}`);
      if (stored) localProfile = JSON.parse(stored);
    } catch {}

    const initialProfile = { ...fallback, ...(localProfile || {}) };
    setProfile(initialProfile);
    setProfileLoading(false);

    let active = true;
    apiFetch("/api/profile", user, { timeout: 8000 })
      .then((data) => {
        if (!active) return;
        const merged = { ...initialProfile, ...(data.profile || {}) };
        setProfile(merged);
        try { window.localStorage.setItem(`offbeat-profile-${user.uid}`, JSON.stringify(merged)); } catch {}
      })
      .catch(() => {});

    return () => { active = false; };
  }, [user]);

  const enterGuestMode = () => {
    setGuest(true);
    setProfile(null);
    setProfileLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setGuest(false);
  };

  if (user === undefined) return <main className={styles.authCard}><div className={styles.authInner}><Logo /><p className={styles.hello}>Loading Offbeat...</p></div></main>;
  if (!user && !guest) return <Landing onGuest={enterGuestMode} />;
  if (user && profileLoading) return <main className={styles.authCard}><div className={styles.authInner}><Logo /><p className={styles.hello}>Getting your Offbeat ready...</p></div></main>;
  if (user && !profile?.name) return <AuthGate user={user} onDone={setProfile} />;
  return <Generator user={user || null} profile={profile} onLogout={logout} />;
}