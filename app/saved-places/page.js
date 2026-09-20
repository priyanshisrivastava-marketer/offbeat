"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebaseClient";

export default function SavedPlacesPage() {
  const [user, setUser] = useState(undefined);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { if (user === null) setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/saved-places", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load saved places.");
        if (active) setItems(data.items || []);
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  const remove = async (id) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/saved-places?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Could not remove this place.");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) { setError(err.message); }
  };

  if (user === null) return <main style={page}><section style={card}><span style={eyebrow}>OFFBEAT</span><h1 style={title}>Your saved places</h1><p style={muted}>Sign in to keep the places you want to come back to.</p><a href="/" style={button}>Back to Offbeat</a></section></main>;
  return <main style={page}><section style={card}>
    <a href="/" style={back}>← Offbeat</a>
    <span style={eyebrow}>YOUR PLACES</span>
    <h1 style={title}>Places worth coming back to.</h1>
    <p style={muted}>Save a place from an adventure and build your own little list of things to explore.</p>
    {loading ? <div style={empty}>Loading your saved places…</div> : error ? <div style={empty}>{error}</div> : items.length === 0 ? <div style={empty}><div style={emptyIcon}>♡</div><h2 style={emptyTitle}>Nothing saved yet</h2><p>When a place catches your eye, save it. It’ll show up here.</p><a href="/" style={button}>Find an adventure</a></div> : <div style={list}>{items.map((item) => <article key={item.id} style={itemCard}>
      <div style={placeTop}><div style={pin}>⌖</div><div style={{ minWidth: 0, flex: 1 }}><h2 style={placeName}>{item.name}</h2><p style={meta}>{[item.city, item.address].filter(Boolean).join(" · ") || "Saved place"}</p></div></div>
      {item.description && <p style={description}>{item.description}</p>}
      <div style={actions}>{item.mapsUrl && <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" style={mapButton}>📍 Open in Maps ↗</a>}<button type="button" onClick={() => remove(item.id)} style={removeButton}>Remove</button></div>
    </article>)}</div>}
  </section></main>;
}

const page={minHeight:"100vh",background:"#f4f0e8",padding:"28px 16px",color:"#17191d",fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,sans-serif"};
const card={maxWidth:680,margin:"0 auto",background:"#fff",borderRadius:28,padding:"24px 20px 28px",boxShadow:"0 16px 50px rgba(23,25,29,.10)"};
const back={display:"inline-block",textDecoration:"none",color:"#77736b",fontSize:13,fontWeight:800,marginBottom:34};
const eyebrow={fontSize:11,fontWeight:900,letterSpacing:".14em",color:"#8a867d"};
const title={margin:"8px 0 10px",fontSize:"clamp(34px,8vw,54px)",lineHeight:1.02,letterSpacing:"-.04em"};
const muted={color:"#6d716c",lineHeight:1.55,fontSize:15};
const list={display:"grid",gap:12,marginTop:28};
const itemCard={padding:16,border:"1px solid #e8e4dc",borderRadius:20,background:"#fcfbf8"};
const placeTop={display:"flex",gap:12,alignItems:"flex-start"};
const pin={width:34,height:34,borderRadius:"50%",background:"#17191d",color:"#fff",display:"grid",placeItems:"center",flex:"0 0 34px",fontWeight:900};
const placeName={margin:"2px 0 5px",fontSize:19,lineHeight:1.2};
const meta={margin:0,color:"#777b76",fontSize:12,lineHeight:1.4};
const description={margin:"12px 0 0",color:"#555a55",fontSize:13,lineHeight:1.5};
const actions={display:"flex",gap:8,flexWrap:"wrap",marginTop:14};
const mapButton={textDecoration:"none",background:"#17191d",color:"#fff",borderRadius:999,padding:"9px 12px",fontSize:12,fontWeight:800};
const removeButton={border:"1px solid #ded9cf",background:"#fff",color:"#6b6d68",borderRadius:999,padding:"9px 12px",fontSize:12,fontWeight:800};
const empty={marginTop:28,padding:"34px 20px",borderRadius:22,background:"#f7f4ed",textAlign:"center",color:"#6d716c",lineHeight:1.5};
const emptyIcon={fontSize:38,color:"#17191d"};
const emptyTitle={margin:"8px 0 2px",color:"#17191d",fontSize:21};
const button={display:"inline-block",marginTop:16,textDecoration:"none",background:"#17191d",color:"#fff",borderRadius:14,padding:"13px 16px",fontWeight:800};
