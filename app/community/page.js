"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebaseClient";
import styles from "./community.module.css";

const VIBES = ["All", "Food", "Chill", "Social", "Adventurous", "Creative", "Shopping"];

function Logo() {
  return <a href="/" className={styles.logoLink}><img src="/brand/offbeat-mark.png" alt="Offbeat" className={styles.logo} /></a>;
}

function getShareId(value) {
  try {
    const url = new URL(value);
    const id = url.searchParams.get("id");
    if (id) return id;
  } catch {}
  return value.trim();
}

export default function CommunityPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [vibe, setVibe] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [spotlighting, setSpotlighting] = useState(false);
  const [spotlightMessage, setSpotlightMessage] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (vibe !== "All") params.set("vibe", vibe);
      const response = await fetch(`/api/community?${params.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load the community.");
      setItems(data.adventures || []);
    } catch (err) {
      setError(err?.message || "Could not load the community.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [vibe]);

  const spotlight = async () => {
    if (!user) {
      setSpotlightMessage("Sign in with Google first, then you can spotlight an adventure.");
      return;
    }
    const shareId = getShareId(shareLink);
    if (!shareId) return;
    setSpotlighting(true);
    setSpotlightMessage("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shareId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not spotlight this adventure.");
      setSpotlightMessage(data.alreadyExists ? "This adventure is already in Spotlight ✨" : "Added to Offbeat Spotlight ✨");
      setShareLink("");
      await load();
    } catch (err) {
      setSpotlightMessage(err?.message || "Could not spotlight this adventure.");
    } finally {
      setSpotlighting(false);
    }
  };

  const visible = useMemo(() => items, [items]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Logo />
          <a className={styles.back} href="/">← Build an adventure</a>
        </header>

        <section className={styles.hero}>
          <span className={styles.kicker}>✦ OFFBEAT COMMUNITY</span>
          <h1>Someone found somewhere worth going.</h1>
          <p>Discover little adventures people have chosen to share. Borrow the idea, make it yours, and take the next step.</p>
        </section>

        <section className={styles.spotlightBox}>
          <div>
            <span className={styles.boxKicker}>SPOTLIGHT YOUR ADVENTURE</span>
            <h2>Found a route worth sharing?</h2>
            <p>Paste an Offbeat share link and put it on the community board. Only adventures you intentionally spotlight appear here.</p>
          </div>
          <div className={styles.submitRow}>
            <input value={shareLink} onChange={(event) => setShareLink(event.target.value)} placeholder="Paste your Offbeat share link" aria-label="Offbeat share link" />
            <button type="button" onClick={spotlight} disabled={spotlighting || !shareLink.trim()}>{spotlighting ? "Adding…" : "Spotlight it"}</button>
          </div>
          {!user && <p className={styles.loginHint}>You&apos;ll need to sign in before adding an adventure to Spotlight.</p>}
          {spotlightMessage && <p className={styles.message}>{spotlightMessage}</p>}
        </section>

        <div className={styles.filterRow} aria-label="Filter by vibe">
          {VIBES.map((item) => <button key={item} type="button" className={`${styles.filter} ${vibe === item ? styles.filterActive : ""}`} onClick={() => setVibe(item)}>{item}</button>)}
        </div>

        {loading && <div className={styles.empty}><strong>Finding the offbeat...</strong><span>Loading the latest community picks.</span></div>}
        {!loading && error && <div className={styles.empty}><strong>Something went sideways.</strong><span>{error}</span><button type="button" onClick={load}>Try again</button></div>}
        {!loading && !error && !visible.length && <div className={styles.empty}><strong>The board is still getting started.</strong><span>Spotlight your first adventure and give someone else an idea for their next few hours.</span></div>}

        {!loading && !error && visible.length > 0 && <section className={styles.grid}>
          {visible.map((item) => (
            <article className={styles.card} key={item.id}>
              <div className={styles.cardTop}><span>{item.city || "Somewhere offbeat"}</span><span>✦ Spotlight</span></div>
              <h2>{item.title}</h2>
              <p className={styles.tagline}>{item.tagline}</p>
              <div className={styles.meta}>
                {item.vibe && <span>{item.vibe}</span>}
                {item.duration && <span>⏱ {item.duration}</span>}
                {item.distance != null && <span>📍 {item.distance} km</span>}
              </div>
              {item.stops?.slice(0, 3).map((stop, index) => <div className={styles.stop} key={`${item.id}-${index}`}><span>{index + 1}</span><strong>{stop.name}</strong></div>)}
              <a className={styles.open} href={`/share?id=${encodeURIComponent(item.shareId)}`}>Open adventure ↗</a>
            </article>
          ))}
        </section>}

        <footer className={styles.footer}>Offbeat · Explore more. Plan less.</footer>
      </div>
    </main>
  );
}
