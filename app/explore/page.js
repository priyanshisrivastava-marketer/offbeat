"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseClient";
import styles from "../page.module.css";

const DURATIONS = ["1–2 hours", "3–4 hours", "Half day", "Full day"];
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

async function apiFetch(path, user, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeout || 30000);
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
      } catch {}
    }
    const response = await fetch(path, { ...fetchOptions, headers, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("This is taking longer than expected. Please try again.");
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export default function ExplorePage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [distance, setDistance] = useState(5);
  const [vibe, setVibe] = useState("Food");
  const [companion, setCompanion] = useState("Solo");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adventure, setAdventure] = useState(null);
  const code = "OFFBEAT";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser || null);
      if (nextUser) {
        let stored = null;
        try { stored = JSON.parse(window.localStorage.getItem(`offbeat-profile-${nextUser.uid}`) || "null"); } catch {}
        setName(stored?.name || nextUser.displayName || "");
      } else {
        try { setName(window.localStorage.getItem("offbeat-pending-name") || ""); } catch {}
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const locateMe = () => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Location is not supported by this browser."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&zoom=10&addressdetails=1`, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Could not find your city.");
        const data = await response.json();
        const address = data.address || {};
        const detectedCity = address.city || address.town || address.village || address.municipality || address.county;
        if (!detectedCity) throw new Error("Could not identify your city.");
        setCity(detectedCity);
      } catch (err) {
        setLocationError(err?.message || "Could not identify your location. You can enter your city manually.");
      } finally { setLocating(false); }
    }, (err) => {
      setLocationError(err?.code === 1 ? "Location permission was denied. You can enter your city manually." : "Your location could not be determined. Please try again or enter your city manually.");
      setLocating(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  const generate = async () => {
    if (!city.trim()) { setError("Enter a city or use Locate me first."); return; }
    setLoading(true); setError(""); setAdventure(null);
    try {
      const placesData = await apiFetch("/api/places", user, { method: "POST", body: JSON.stringify({ city: city.trim(), vibe, distance }) });
      if (!placesData.places?.length) throw new Error(`I couldn't find suitable ${vibe.toLowerCase()} places in ${city}. Try a nearby city or a larger distance.`);
      const advData = await apiFetch("/api/adventure", user, { method: "POST", body: JSON.stringify({ city: city.trim(), duration, distance, vibe, companion, places: placesData.places }) });
      setAdventure(advData.adventure);
      if (user) {
        try {
          const profile = { name: name.trim() || user.displayName || "", email: user.email || "", photoURL: user.photoURL || "", defaultCity: city.trim(), favoriteVibe: vibe, favoriteCompanion: companion, preferredDistance: distance };
          window.localStorage.setItem(`offbeat-profile-${user.uid}`, JSON.stringify(profile));
          await apiFetch("/api/profile", user, { method: "POST", body: JSON.stringify(profile), timeout: 8000 });
        } catch {}
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  if (!authReady) return <main className={styles.authCard}><div className={styles.authInner}><img className={styles.brand} src="/brand/offbeat-mark.png" alt="Offbeat" /><p className={styles.hello}>Getting your Offbeat ready...</p></div></main>;

  return (
    <main className={styles.generatorWrap}>
      <div className={styles.generator}>
        <header className={styles.appHeader}>
          <img className={styles.miniBrand} src="/brand/offbeat-mark.png" alt="Offbeat" />
          <div>
            <div className={styles.hello}>{user ? `Hi, ${name || user.displayName || "there"}` : "Guest mode"}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px", flexWrap: "wrap", marginTop: "4px" }}>
              <a
                href="/community"
                style={{ color: "#17191d", fontWeight: 800, textDecoration: "none", fontSize: ".82rem", padding: "5px 0" }}
                aria-label="Open Offbeat Community"
              >
                ✦ Community
              </a>
              {user && <button className={styles.signout} onClick={() => signOut(auth)} type="button">Sign out</button>}
            </div>
          </div>
        </header>

        <section className={styles.panel}>
          <span className={styles.eyebrow} style={{ background: "#17191d", color: "#fff" }}>✦ Build a little adventure</span>
          <h1 className={styles.ticketTitle}>Where are you going?</h1>
          <p className={styles.ticketSub}>Give Offbeat a city, a mood and a little time. We will handle the rest.</p>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="explore-city">City</label>
            <div className={styles.locationInputRow}>
              <input id="explore-city" className={styles.input} value={city} onChange={(e) => { setCity(e.target.value); setLocationError(""); }} placeholder="Mumbai, Delhi, Jaipur..." />
              <button className={styles.locateButton} onClick={locateMe} disabled={locating} type="button">{locating ? "Locating…" : "📍 Locate me"}</button>
            </div>
            {locationError && <p className={styles.locationError}>{locationError}</p>}
          </div>

          <div className={styles.section}><span className={styles.label}>Time</span><div className={styles.choiceGrid}>{DURATIONS.map((value) => <button key={value} className={`${styles.choice} ${duration === value ? styles.choiceActive : ""}`} onClick={() => setDuration(value)} type="button">⏱️ {value}</button>)}</div></div>

          <div className={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}><span className={styles.label} style={{ marginBottom: 0 }}>How far will you go?</span><strong>{distance} km</strong></div>
            <input aria-label="Maximum distance" type="range" min="1" max="30" step="1" value={distance} onChange={(e) => setDistance(Number(e.target.value))} style={{ width: "100%", accentColor: "#17191d", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#8a8f8b", fontSize: ".66rem", fontWeight: 700 }}><span>1 km</span><span>30 km</span></div>
          </div>

          <div className={styles.section}><span className={styles.label}>Vibe</span><div className={styles.choiceGrid}>{VIBES.map((item) => <button key={item.label} className={`${styles.choice} ${vibe === item.label ? styles.choiceActive : ""}`} onClick={() => setVibe(item.label)} type="button">{item.icon} {item.label}</button>)}</div></div>
          <div className={styles.section}><span className={styles.label}>Who is coming?</span><div className={styles.choiceGrid}>{COMPANIONS.map((item) => <button key={item.label} className={`${styles.choice} ${companion === item.label ? styles.choiceActive : ""}`} onClick={() => setCompanion(item.label)} type="button">{item.icon} {item.label}</button>)}</div></div>

          <button className={styles.generate} onClick={generate} disabled={loading} type="button">{loading ? "Finding your route..." : "Find my Offbeat adventure"}</button>
          <p className={styles.guestNote}>{user ? "Your preferences can be remembered for next time." : "Guest mode is private and unsaved."}</p>
          {error && <p className={styles.error}>{error}</p>}
        </section>

        {adventure && <article className={styles.ticket}>
          <div className={styles.ticketTop}><div className={styles.ticketCode}>BOARDING PASS · #{code}</div><h2 className={styles.ticketTitle}>{adventure.title}</h2><p className={styles.ticketSub}>{adventure.tagline}</p></div>
          <div className={styles.stops}>{(adventure.stops || []).map((stop, index) => <div className={styles.stop} key={`${stop.name}-${index}`}><span className={styles.stopNum}>{index + 1}</span><strong>{stop.name}</strong><div><a className={styles.map} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${city}`)}`} target="_blank" rel="noopener noreferrer">📍 Open in Maps ↗</a></div>{stop.description && <p>{stop.description}</p>}</div>)}</div>
        </article>}
      </div>
    </main>
  );
}
