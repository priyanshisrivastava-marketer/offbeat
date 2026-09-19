"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebaseClient";

const DURATIONS = ["2 hours", "4 hours"];
const VIBES = [
  { label: "Chill", icon: "🌿" },
  { label: "Social", icon: "🎉" },
  { label: "Adventurous", icon: "🧭" },
  { label: "Creative", icon: "🎨" },
];
const COMPANIONS = [
  { label: "Solo", icon: "🚶" },
  { label: "Friends group", icon: "👯" },
  { label: "Partner", icon: "💞" },
  { label: "Family", icon: "👨‍👩‍👧" },
];

function ticketCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

const styles = {
  bg: { minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "radial-gradient(circle at 15% 0%, #FDEBD0 0%, transparent 45%), radial-gradient(circle at 100% 20%, #DCEDEA 0%, transparent 40%), #F5F6F3" },
  card: { background: "#fff", borderRadius: "18px", padding: "24px", boxShadow: "0 16px 40px -16px rgba(26,26,26,0.18)" },
  input: { width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #1A1A1A22", boxSizing: "border-box" },
};

function GoogleLogin({ loading, onLogin }) {
  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { onLogin(e.message); }
  };
  return (
    <button onClick={login} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, background: "#fff", border: "2px solid #1A1A1A18", color: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", opacity: loading ? .6 : 1 }}>
      <span style={{ fontSize: "1.1rem" }}>G</span>{loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
}

function AuthScreen() {
  const [error, setError] = useState("");
  return (
    <div style={{ ...styles.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Offbeat</h1>
          <p style={{ opacity: .6, marginTop: 6 }}>A ticket out the door, whenever you need one.</p>
          <p style={{ margin: "4px 0 0", fontSize: ".78rem", fontWeight: 600, opacity: .55 }}>By Priyanshi Srivastava</p>
        </div>
        <div style={styles.card}>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>Ready to go somewhere?</h2>
          <p style={{ margin: "0 0 18px", opacity: .6, fontSize: ".88rem" }}>Sign in with Google to save your adventures and preferences.</p>
          <GoogleLogin onLogin={setError} />
          {error && <p style={{ color: "#B4483A", fontSize: ".82rem", marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ProfileSetup({ user, onDone }) {
  const [name, setName] = useState(user.displayName || "");
  const [loading, setLoading] = useState(false);
  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await setDoc(doc(db, "users", user.uid), { name: name.trim(), email: user.email || "", photoURL: user.photoURL || "", updatedAt: serverTimestamp() }, { merge: true });
    setLoading(false);
    onDone(name.trim());
  };
  return <div style={{ ...styles.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}><div style={{ width: "100%", maxWidth: 360 }}><div style={{ textAlign: "center", marginBottom: 24 }}><h1 style={{ fontSize: "2.2rem", margin: 0 }}>Offbeat</h1></div><div style={styles.card}><label style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", opacity: .6, display: "block", marginBottom: 8 }}>What's your name?</label><input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="e.g. Priya" style={{ ...styles.input, marginBottom: 16 }} /><button onClick={save} disabled={loading} style={{ width: "100%", padding: 14, borderRadius: 12, fontWeight: 800, background: "linear-gradient(135deg,#E8A33D,#D98A2A)", border: "none" }}>{loading ? "..." : "Let's go"}</button></div></div></div>;
}

function CompletedTab({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "users", userId, "completed_adventures"), orderBy("completedAt", "desc"));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setItems([]); }
      setLoading(false);
    })();
  }, [userId]);
  if (loading) return <p style={{ textAlign: "center", opacity: .6, marginTop: "2rem" }}>Loading your adventures...</p>;
  if (!items.length) return <div style={{ textAlign: "center", marginTop: "3rem" }}><p style={{ fontSize: "2.5rem", marginBottom: 8 }}>🗺️</p><p style={{ opacity: .6, fontWeight: 600 }}>No adventures completed yet.</p></div>;
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{items.map(a => <div key={a.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 8px 20px -12px rgba(26,26,26,.2)" }}><div style={{ display: "flex", justifyContent: "space-between" }}><p style={{ margin: 0, fontWeight: 800 }}>{a.title}</p><span style={{ fontSize: ".7rem", color: "#2B6E6B", fontWeight: 700 }}>✓ Done</span></div><p style={{ margin: "4px 0 8px", opacity: .6, fontSize: ".82rem" }}>{a.city} · {a.completedAt?.toDate ? a.completedAt.toDate().toLocaleDateString() : "Completed"}</p>{a.stops?.map((s, i) => <a key={i} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${a.city}`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", margin: "4px 0", color: "#2B6E6B", fontSize: ".78rem", fontWeight: 700, textDecoration: "none" }}>📍 {s.name} ↗</a>)}<div style={{ display: "flex", gap: 8, marginTop: 8 }}><span style={{ background: "#2B6E6B14", color: "#2B6E6B", fontSize: ".72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{a.vibe}</span><span style={{ background: "#E8A33D22", color: "#8a5c1c", fontSize: ".72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{a.companion}</span></div></div>)}</div>;
}

export default function Home() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tab, setTab] = useState("new");
  const [city, setCity] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [vibe, setVibe] = useState(VIBES[0].label);
  const [companion, setCompanion] = useState(COMPANIONS[0].label);
  const [loading, setLoading] = useState(false);
  const [adventure, setAdventure] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const [code] = useState(ticketCode());

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) { setProfile(null); setProfileLoading(false); return; }
    setProfileLoading(true);
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      setProfile(data);
      if (data.defaultCity) setCity(data.defaultCity);
      if (data.favoriteVibe) setVibe(data.favoriteVibe);
      if (data.favoriteCompanion) setCompanion(data.favoriteCompanion);
      setProfileLoading(false);
    })();
  }, [user]);

  const getToken = async () => user.getIdToken();

  const generate = async () => {
    if (!city.trim()) return;
    setLoading(true); setErrorMsg(""); setAdventure(null); setJustCompleted(false);
    try {
      const token = await getToken();
      const placesRes = await fetch("/api/places", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ city, vibe }) });
      const placesData = await placesRes.json();
      if (placesData.error) throw new Error(placesData.error);
      const advRes = await fetch("/api/adventure", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ city, duration, vibe, companion, places: placesData.places }) });
      const advData = await advRes.json();
      if (advData.error) throw new Error(advData.error);
      setAdventure(advData.adventure);
      await setDoc(doc(db, "users", user.uid), { name: profile?.name || user.displayName || "", email: user.email || "", photoURL: user.photoURL || "", defaultCity: city, favoriteVibe: vibe, favoriteCompanion: companion, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) { setErrorMsg(e.message); }
    setLoading(false);
  };

  const markCompleted = async () => {
    if (!adventure || justCompleted) return;
    await addDoc(collection(db, "users", user.uid, "completed_adventures"), { title: adventure.title, city, vibe, companion, stops: adventure.stops, completedAt: serverTimestamp() });
    setJustCompleted(true);
  };

  const reset = () => { setAdventure(null); setErrorMsg(""); setJustCompleted(false); };
  const logout = async () => { await signOut(auth); setProfile(null); setAdventure(null); };

  if (user === undefined) return <div style={{ ...styles.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ opacity: .5 }}>Loading...</p></div>;
  if (!user) return <AuthScreen />;
  if (profileLoading) return <div style={{ ...styles.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ opacity: .5 }}>Loading profile...</p></div>;
  if (!profile?.name) return <ProfileSetup user={user} onDone={name => setProfile(p => ({ ...(p || {}), name }))} />;

  return <div style={styles.bg}><style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes revealTicket{0%{opacity:0;transform:translateY(18px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}} .choice{transition:transform .15s ease}.choice:hover{transform:translateY(-2px)} .cta{transition:transform .15s ease,filter .15s ease}.cta:hover{transform:translateY(-2px);filter:brightness(1.04)}`}</style><div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 24px" }}>
    <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ display: "inline-flex", background: "#1A1A1A", color: "#F5F6F3", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 12 }}>✨ Welcome back, {profile.name}</div><h1 style={{ fontSize: "2.1rem", fontWeight: 800, margin: 0 }}>Offbeat</h1><p style={{ margin: "4px 0 0", fontSize: ".78rem", fontWeight: 600, opacity: .55 }}>By Priyanshi Srivastava</p><button onClick={logout} style={{ background: "none", border: "none", textDecoration: "underline", opacity: .5, fontSize: ".8rem", marginTop: 6, cursor: "pointer" }}>Sign out</button></div>
    <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#1A1A1A0F", padding: 4, borderRadius: 999 }}><button onClick={() => setTab("new")} style={{ flex: 1, padding: 10, borderRadius: 999, fontWeight: 700, border: "none", background: tab === "new" ? "#fff" : "transparent" }}>New Adventure</button><button onClick={() => setTab("completed")} style={{ flex: 1, padding: 10, borderRadius: 999, fontWeight: 700, border: "none", background: tab === "completed" ? "#fff" : "transparent" }}>Completed</button></div>
    {tab === "completed" ? <CompletedTab userId={user.uid} /> : <>
      {!adventure && !loading && <div style={{ ...styles.card, padding: 26 }}><label style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", opacity: .6, display: "block", marginBottom: 8 }}>Where are you?</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" style={{ ...styles.input, marginBottom: 18 }} /><p style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", opacity: .6, marginBottom: 8 }}>How much time?</p><div style={{ display: "flex", gap: 8, marginBottom: 18 }}>{DURATIONS.map(d => <button key={d} onClick={() => setDuration(d)} className="choice" style={{ flex: 1, padding: 10, borderRadius: 12, fontWeight: 700, border: duration === d ? "2px solid #1A1A1A" : "2px solid #1A1A1A18", background: duration === d ? "#1A1A1A" : "#F9FAF8", color: duration === d ? "#fff" : "#1A1A1A" }}>{d}</button>)}</div><p style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", opacity: .6, marginBottom: 8 }}>What's the vibe?</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>{VIBES.map(v => <button key={v.label} onClick={() => setVibe(v.label)} className="choice" style={{ padding: 10, borderRadius: 12, fontWeight: 700, border: vibe === v.label ? "2px solid #2B6E6B" : "2px solid #1A1A1A18", background: vibe === v.label ? "#2B6E6B" : "#F9FAF8", color: vibe === v.label ? "#fff" : "#1A1A1A" }}>{v.icon} {v.label}</button>)}</div><p style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", opacity: .6, marginBottom: 8 }}>Who's it for?</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>{COMPANIONS.map(c => <button key={c.label} onClick={() => setCompanion(c.label)} className="choice" style={{ padding: 10, borderRadius: 12, fontWeight: 700, border: companion === c.label ? "2px solid #E8A33D" : "2px solid #1A1A1A18", background: companion === c.label ? "#E8A33D" : "#F9FAF8", color: "#1A1A1A" }}>{c.icon} {c.label}</button>)}</div><button onClick={generate} className="cta" style={{ width: "100%", padding: 14, borderRadius: 12, fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg,#E8A33D,#D98A2A)", border: "none" }}>✨ Surprise me</button></div>}
      {loading && <div style={{ textAlign: "center", marginTop: 48 }}><div style={{ width: 44, height: 44, margin: "0 auto 16px", borderRadius: "50%", border: "3px solid #1A1A1A22", borderTopColor: "#E8A33D", animation: "spin .8s linear infinite" }} /><p style={{ opacity: .7, fontWeight: 600 }}>Scouting your adventure...</p></div>}
      {errorMsg && <div style={{ textAlign: "center", marginTop: 24 }}><p style={{ color: "#B4483A", fontWeight: 600 }}>{errorMsg}</p><button onClick={reset} style={{ marginTop: 8, textDecoration: "underline", background: "none", border: "none" }}>Try again</button></div>}
      {adventure && <div style={{ animation: "revealTicket .6s cubic-bezier(.16,1,.3,1)" }}><div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 40px -12px rgba(26,26,26,.35),0 0 0 2px #1A1A1A" }}><div style={{ padding: 22, background: "linear-gradient(135deg,#E8A33D,#F0B94D 45%,#D98A2A)" }}><p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", opacity: .65, margin: 0, fontWeight: 700 }}>Boarding pass · #{code}</p><h2 style={{ fontSize: "1.5rem", margin: "8px 0 0", fontWeight: 800 }}>{adventure.title}</h2></div><div style={{ padding: "18px 22px 0" }}><p style={{ fontStyle: "italic", opacity: .75 }}>{adventure.tagline}</p><span style={{ background: "#2B6E6B14", color: "#2B6E6B", fontSize: ".75rem", fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>⏱ {adventure.duration}</span></div><div style={{ borderTop: "2.5px dashed #1A1A1A33", margin: "20px 0" }} /><div style={{ padding: "0 22px 22px" }}>{adventure.stops.map((s, i) => <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}><div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "#1A1A1A", color: "#fff", fontSize: ".75rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div><div><p style={{ margin: 0, fontWeight: 700 }}>{s.name}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${city}`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 4, color: "#2B6E6B", fontSize: ".78rem", fontWeight: 700, textDecoration: "none" }}>📍 Open in Maps ↗</a><p style={{ margin: "2px 0 0", opacity: .7, fontSize: ".85rem" }}>{s.description}</p></div></div>)}<p style={{ marginTop: 16, color: "#2B6E6B", fontWeight: 700, borderLeft: "3px solid #2B6E6B", paddingLeft: 10 }}>{adventure.vibe_line}</p></div></div><button onClick={markCompleted} disabled={justCompleted} className="cta" style={{ marginTop: 16, width: "100%", padding: 14, borderRadius: 999, fontWeight: 700, background: justCompleted ? "#2B6E6B22" : "#2B6E6B", color: justCompleted ? "#2B6E6B" : "#fff", border: "none" }}>{justCompleted ? "✓ Marked as completed" : "I went! Mark as completed"}</button><button onClick={reset} className="cta" style={{ marginTop: 10, width: "100%", padding: 14, borderRadius: 999, fontWeight: 700, background: "#1A1A1A", color: "#fff", border: "none" }}>Get another adventure</button></div>}
    </>}
  </div></div>;
}
