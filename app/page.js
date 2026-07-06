"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

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

function ticketCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: authError } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (mode === "signup" && !data.session) {
        setError("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else if (data.session) {
        onAuthed(data.session);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "360px", margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "24px", boxShadow: "0 16px 40px -16px rgba(26,26,26,0.18)" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px", background: "#1A1A1A0F", padding: "4px", borderRadius: "999px" }}>
          <button
            onClick={() => setMode("signin")}
            style={{ flex: 1, padding: "8px", borderRadius: "999px", fontWeight: 700, border: "none", background: mode === "signin" ? "#fff" : "transparent", color: "#1A1A1A", cursor: "pointer" }}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{ flex: 1, padding: "8px", borderRadius: "999px", fontWeight: 700, border: "none", background: mode === "signup" ? "#fff" : "transparent", color: "#1A1A1A", cursor: "pointer" }}
          >
            Sign up
          </button>
        </div>
        <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, display: "block", marginBottom: "6px" }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #1A1A1A22", marginBottom: "14px", boxSizing: "border-box" }}
        />
        <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, display: "block", marginBottom: "6px" }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="At least 6 characters"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #1A1A1A22", marginBottom: "18px", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#B4483A", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, background: "linear-gradient(135deg,#E8A33D,#D98A2A)", border: "none", color: "#1A1A1A", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

function ProfileSetup({ userId, onDone }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await supabase.from("profiles").upsert({ id: userId, name: name.trim() });
    setLoading(false);
    onDone(name.trim());
  };

  return (
    <div style={{ maxWidth: "360px", margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "24px", boxShadow: "0 16px 40px -16px rgba(26,26,26,0.18)" }}>
        <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, display: "block", marginBottom: "8px" }}>What's your name?</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="e.g. Priya"
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #1A1A1A22", marginBottom: "16px", boxSizing: "border-box" }}
        />
        <button
          onClick={save}
          disabled={loading}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, background: "linear-gradient(135deg,#E8A33D,#D98A2A)", border: "none", color: "#1A1A1A" }}
        >
          {loading ? "..." : "Let's go"}
        </button>
      </div>
    </div>
  );
}

function CompletedTab({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("completed_adventures")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <p style={{ textAlign: "center", opacity: 0.6, marginTop: "2rem" }}>Loading your adventures...</p>;
  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🗺️</p>
        <p style={{ opacity: 0.6, fontWeight: 600 }}>No adventures completed yet.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {items.map((a) => (
        <div key={a.id} style={{ background: "#fff", borderRadius: "14px", padding: "16px 18px", boxShadow: "0 8px 20px -12px rgba(26,26,26,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 800 }}>{a.title}</p>
            <span style={{ fontSize: "0.7rem", color: "#2B6E6B", fontWeight: 700 }}>✓ Done</span>
          </div>
          <p style={{ margin: "4px 0 8px", opacity: 0.6, fontSize: "0.82rem" }}>
            {a.city} · {new Date(a.completed_at).toLocaleDateString()}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ background: "#2B6E6B14", color: "#2B6E6B", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>{a.vibe}</span>
            <span style={{ background: "#E8A33D22", color: "#8a5c1c", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>{a.companion}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setProfileLoading(true);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(data || {});
      if (data) {
        if (data.default_city) setCity(data.default_city);
        if (data.favorite_vibe) setVibe(data.favorite_vibe);
        if (data.favorite_companion) setCompanion(data.favorite_companion);
      }
      setProfileLoading(false);
    })();
  }, [session]);

  const generate = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setAdventure(null);
    setJustCompleted(false);
    try {
      const placesRes = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, vibe }),
      });
      const placesData = await placesRes.json();
      if (placesData.error) throw new Error(placesData.error);

      const advRes = await fetch("/api/adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, duration, vibe, companion, places: placesData.places }),
      });
      const advData = await advRes.json();
      if (advData.error) throw new Error(advData.error);

      setAdventure(advData.adventure);

      // Save these as the user's latest defaults for next time
      await supabase.from("profiles").upsert({
        id: session.user.id,
        name: profile?.name,
        default_city: city,
        favorite_vibe: vibe,
        favorite_companion: companion,
      });
    } catch (e) {
      setErrorMsg(e.message);
    }
    setLoading(false);
  };

  const markCompleted = async () => {
    if (!adventure || justCompleted) return;
    await supabase.from("completed_adventures").insert({
      user_id: session.user.id,
      title: adventure.title,
      city,
      vibe,
      companion,
      stops: adventure.stops,
    });
    setJustCompleted(true);
  };

  const reset = () => {
    setAdventure(null);
    setErrorMsg("");
    setJustCompleted(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setAdventure(null);
  };

  const bgStyle = {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "radial-gradient(circle at 15% 0%, #FDEBD0 0%, transparent 45%), radial-gradient(circle at 100% 20%, #DCEDEA 0%, transparent 40%), #F5F6F3",
  };

  const globalStyles = (
    <style>{`
      @keyframes revealTicket { 0% { opacity: 0; transform: translateY(18px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .choice { transition: transform .15s ease, box-shadow .15s ease; }
      .choice:hover { transform: translateY(-2px); }
      .cta { transition: transform .15s ease, filter .15s ease; }
      .cta:hover { transform: translateY(-2px); filter: brightness(1.04); }
      .cta:active { transform: scale(.98); }
    `}</style>
  );

  if (session === undefined) {
    return (
      <div style={{ ...bgStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ opacity: 0.5 }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ ...bgStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {globalStyles}
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Offbeat</h1>
            <p style={{ opacity: 0.6, marginTop: "6px" }}>A ticket out the door, whenever you need one.</p>
    <p
  style={{
    margin: "4px 0 0",
    fontSize: "0.78rem",
    fontWeight: 600,
    opacity: 0.55,
    letterSpacing: "0.04em",
  }}
>
  By Priyanshi Srivastava
</p>

          </div>
          <AuthForm onAuthed={setSession} />
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div style={{ ...bgStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {globalStyles}
        <p style={{ opacity: 0.5 }}>Loading profile...</p>
      </div>
    );
  }

  if (!profile.name) {
    return (
      <div style={{ ...bgStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {globalStyles}
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Offbeat</h1>
          </div>
          <ProfileSetup userId={session.user.id} onDone={(name) => setProfile({ ...profile, name })} />
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      {globalStyles}
      <div style={{ maxWidth: "420px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-flex", background: "#1A1A1A", color: "#F5F6F3", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "999px", marginBottom: "12px" }}>
            ✨ Welcome back, {profile.name}
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Offbeat</h1>
              <p
  style={{
    margin: "4px 0 0",
    fontSize: "0.78rem",
    fontWeight: 600,
    opacity: 0.55,
    letterSpacing: "0.04em"
  }}
>
  By Priyanshi Srivastava
</p>

          <button onClick={signOut} style={{ background: "none", border: "none", textDecoration: "underline", opacity: 0.5, fontSize: "0.8rem", marginTop: "6px", cursor: "pointer" }}>
            Sign out
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "#1A1A1A0F", padding: "4px", borderRadius: "999px" }}>
          <button onClick={() => setTab("new")} style={{ flex: 1, padding: "10px", borderRadius: "999px", fontWeight: 700, border: "none", background: tab === "new" ? "#fff" : "transparent", cursor: "pointer" }}>
            New Adventure
          </button>
          <button onClick={() => setTab("completed")} style={{ flex: 1, padding: "10px", borderRadius: "999px", fontWeight: 700, border: "none", background: tab === "completed" ? "#fff" : "transparent", cursor: "pointer" }}>
            Completed
          </button>
        </div>

        {tab === "completed" ? (
          <CompletedTab userId={session.user.id} />
        ) : (
          <>
            {!adventure && !loading && (
              <div style={{ background: "#fff", borderRadius: "20px", padding: "26px", boxShadow: "0 16px 40px -16px rgba(26,26,26,0.18)" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, display: "block", marginBottom: "8px" }}>Where are you?</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #1A1A1A22", marginBottom: "18px", boxSizing: "border-box" }}
                />

                <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, marginBottom: "8px" }}>How much time?</p>
                <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => setDuration(d)} className="choice" style={{ flex: 1, padding: "10px", borderRadius: "12px", fontWeight: 700, border: duration === d ? "2px solid #1A1A1A" : "2px solid #1A1A1A18", background: duration === d ? "#1A1A1A" : "#F9FAF8", color: duration === d ? "#fff" : "#1A1A1A" }}>
                      {d}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, marginBottom: "8px" }}>What's the vibe?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "18px" }}>
                  {VIBES.map((v) => (
                    <button key={v.label} onClick={() => setVibe(v.label)} className="choice" style={{ padding: "10px", borderRadius: "12px", fontWeight: 700, border: vibe === v.label ? "2px solid #2B6E6B" : "2px solid #1A1A1A18", background: vibe === v.label ? "#2B6E6B" : "#F9FAF8", color: vibe === v.label ? "#fff" : "#1A1A1A" }}>
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, marginBottom: "8px" }}>Who's it for?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
                  {COMPANIONS.map((c) => (
                    <button key={c.label} onClick={() => setCompanion(c.label)} className="choice" style={{ padding: "10px", borderRadius: "12px", fontWeight: 700, border: companion === c.label ? "2px solid #E8A33D" : "2px solid #1A1A1A18", background: companion === c.label ? "#E8A33D" : "#F9FAF8", color: "#1A1A1A" }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>

                <button onClick={generate} className="cta" style={{ width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg,#E8A33D,#D98A2A)", border: "none", color: "#1A1A1A" }}>
                  ✨ Surprise me
                </button>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", marginTop: "48px" }}>
                <div style={{ width: "44px", height: "44px", margin: "0 auto 16px", borderRadius: "50%", border: "3px solid #1A1A1A22", borderTopColor: "#E8A33D", animation: "spin 0.8s linear infinite" }} />
                <p style={{ opacity: 0.7, fontWeight: 600 }}>Scouting your adventure...</p>
              </div>
            )}

            {errorMsg && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <p style={{ color: "#B4483A", fontWeight: 600 }}>{errorMsg}</p>
                <button onClick={reset} style={{ marginTop: "8px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Try again</button>
              </div>
            )}

            {adventure && (
              <div style={{ animation: "revealTicket 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ background: "#fff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 20px 40px -12px rgba(26,26,26,0.35), 0 0 0 2px #1A1A1A" }}>
                  <div style={{ padding: "22px", background: "linear-gradient(135deg,#E8A33D,#F0B94D 45%,#D98A2A)" }}>
                    <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65, margin: 0, fontWeight: 700 }}>Boarding pass · #{code}</p>
                    <h2 style={{ fontSize: "1.5rem", margin: "8px 0 0", fontWeight: 800 }}>{adventure.title}</h2>
                  </div>
                  <div style={{ padding: "18px 22px 0" }}>
                    <p style={{ fontStyle: "italic", opacity: 0.75 }}>{adventure.tagline}</p>
                    <span style={{ background: "#2B6E6B14", color: "#2B6E6B", fontSize: "0.75rem", fontWeight: 700, padding: "5px 12px", borderRadius: "999px" }}>⏱ {adventure.duration}</span>
                  </div>
                  <div style={{ borderTop: "2.5px dashed #1A1A1A33", margin: "20px 0" }} />
                  <div style={{ padding: "0 22px 22px" }}>
                    {adventure.stops.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                        <div style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "50%", background: "#1A1A1A", color: "#fff", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>{s.name}</p>
                      <a
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${s.name}, ${city}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-block",
    marginTop: "4px",
    marginBottom: "4px",
    color: "#2B6E6B",
    fontSize: "0.78rem",
    fontWeight: 700,
    textDecoration: "none"
  }}
>
  📍 Open in Maps ↗
</a>
                          <p style={{ margin: "2px 0 0", opacity: 0.7, fontSize: "0.85rem" }}>{s.description}</p>
                        </div>
                      </div>
                    ))}
                    <p style={{ marginTop: "16px", color: "#2B6E6B", fontWeight: 700, borderLeft: "3px solid #2B6E6B", paddingLeft: "10px" }}>{adventure.vibe_line}</p>
                  </div>
                </div>

                <button onClick={markCompleted} disabled={justCompleted} className="cta" style={{ marginTop: "16px", width: "100%", padding: "14px", borderRadius: "999px", fontWeight: 700, background: justCompleted ? "#2B6E6B22" : "#2B6E6B", color: justCompleted ? "#2B6E6B" : "#fff", border: "none" }}>
                  {justCompleted ? "✓ Marked as completed" : "I went! Mark as completed"}
                </button>
                <button onClick={reset} className="cta" style={{ marginTop: "10px", width: "100%", padding: "14px", borderRadius: "999px", fontWeight: 700, background: "#1A1A1A", color: "#fff", border: "none" }}>
                  Get another adventure
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
