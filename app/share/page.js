"use client";

import { useEffect, useMemo, useState } from "react";

function decodeLegacyAdventure(value) {
  try {
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SharedAdventurePage() {
  const [adventure, setAdventure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const encoded = params.get("a");

    async function load() {
      if (id) {
        try {
          const response = await fetch(`/api/share?id=${encodeURIComponent(id)}`, { cache: "no-store" });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.adventure) throw new Error(data.error || "This adventure could not be found.");
          if (active) setAdventure({ ...data.adventure, city: data.city, vibe: data.vibe, companion: data.companion, duration: data.duration, distance: data.distance });
        } catch (err) {
          if (active) setError(err?.message || "Could not open this adventure.");
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      if (encoded) {
        const legacy = decodeLegacyAdventure(encoded);
        if (active) {
          if (legacy) setAdventure(legacy);
          else setError("The share link is incomplete or invalid.");
          setLoading(false);
        }
        return;
      }

      if (active) {
        setError("No adventure was included in this link.");
        setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  const mapUrl = (stop) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${adventure?.city || ""}`)}`;
  const stops = useMemo(() => adventure?.stops || [], [adventure]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (loading) {
    return <main style={page}><div style={card}><div style={brand}>OFFBEAT</div><p style={muted}>Opening your adventure…</p></div></main>;
  }

  if (error || !adventure) {
    return <main style={page}><div style={card}><div style={brand}>OFFBEAT</div><h1 style={title}>This adventure could not be opened.</h1><p style={muted}>{error || "The share link may be incomplete or expired."}</p><a href="/" style={button}>Create your own adventure</a></div></main>;
  }

  return (
    <main style={page}>
      <div style={card}>
        <div style={top}><div style={brand}>OFFBEAT</div><span style={badge}>SHARED ADVENTURE</span></div>
        <p style={eyebrow}>{adventure.city || "Somewhere offbeat"}{adventure.vibe ? ` · ${adventure.vibe}` : ""}</p>
        <h1 style={title}>{adventure.title || "Your Offbeat adventure"}</h1>
        {adventure.tagline && <p style={tagline}>{adventure.tagline}</p>}
        <div style={meta}>
          {adventure.duration && <span style={metaPill}>⏱️ {adventure.duration}</span>}
          {adventure.distance != null && <span style={metaPill}>📍 Up to {adventure.distance} km</span>}
          {adventure.companion && <span style={metaPill}>✦ {adventure.companion}</span>}
        </div>
        <div style={routeLabel}>YOUR STOPS</div>
        <div style={stopsWrap}>
          {stops.map((stop, index) => (
            <article key={`${stop.name}-${index}`} style={stopCard}>
              <div style={number}>{index + 1}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={stopName}>{stop.name}</h2>
                {stop.description && <p style={description}>{stop.description}</p>}
                <a href={mapUrl(stop)} target="_blank" rel="noopener noreferrer" style={mapButton}>📍 Open in Maps ↗</a>
              </div>
            </article>
          ))}
        </div>
        <div style={actions}>
          <button type="button" onClick={copyLink} style={secondary}>{copied ? "✓ Link copied" : "Copy adventure link"}</button>
          <a href="/" style={button}>Make your own</a>
        </div>
        <p style={footer}>Made with Offbeat · Explore more. Plan less.</p>
      </div>
    </main>
  );
}

const page = { minHeight: "100vh", background: "#f4f0e8", padding: "28px 16px", color: "#17191d", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" };
const card = { maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 28, padding: "24px 20px 22px", boxShadow: "0 16px 50px rgba(23,25,29,.10)" };
const top = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const brand = { fontSize: 13, fontWeight: 900, letterSpacing: ".14em" };
const badge = { fontSize: 10, fontWeight: 800, letterSpacing: ".08em", padding: "7px 9px", borderRadius: 999, background: "#f1ece2" };
const eyebrow = { margin: "30px 0 8px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#77736b" };
const title = { margin: 0, fontSize: "clamp(32px, 8vw, 54px)", lineHeight: 1.02, letterSpacing: "-.04em" };
const tagline = { margin: "14px 0 0", color: "#656a65", lineHeight: 1.5, fontSize: 16 };
const meta = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 };
const metaPill = { background: "#f5f3ee", borderRadius: 999, padding: "8px 11px", fontSize: 12, fontWeight: 700 };
const routeLabel = { marginTop: 28, marginBottom: 10, fontSize: 11, fontWeight: 900, letterSpacing: ".13em", color: "#8a867d" };
const stopsWrap = { display: "grid", gap: 10 };
const stopCard = { display: "flex", gap: 12, padding: 14, border: "1px solid #e9e5dd", borderRadius: 18, background: "#fcfbf8" };
const number = { flex: "0 0 30px", width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", background: "#17191d", color: "#fff", fontSize: 12, fontWeight: 900 };
const stopName = { margin: "3px 0 5px", fontSize: 17, lineHeight: 1.2 };
const description = { margin: "0 0 10px", color: "#707570", fontSize: 13, lineHeight: 1.45 };
const mapButton = { display: "inline-block", textDecoration: "none", color: "#17191d", background: "#ece8df", borderRadius: 999, padding: "8px 11px", fontSize: 12, fontWeight: 800 };
const actions = { display: "grid", gap: 9, marginTop: 20 };
const button = { display: "block", textAlign: "center", textDecoration: "none", background: "#17191d", color: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 800 };
const secondary = { border: "1px solid #ded9cf", background: "#fff", color: "#17191d", borderRadius: 14, padding: "13px 16px", fontWeight: 800, cursor: "pointer" };
const footer = { margin: "22px 0 0", textAlign: "center", color: "#929088", fontSize: 11 };
const muted = { color: "#6d716c", lineHeight: 1.5, margin: "10px 0 20px" };
