import { getAdminAuth, getAdminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireUser(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("Sign in to spotlight an adventure.");
  return getAdminAuth().verifyIdToken(token);
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city")?.trim().toLowerCase();
    const vibe = url.searchParams.get("vibe")?.trim().toLowerCase();
    const snapshot = await getAdminDb()
      .collection("community_adventures")
      .orderBy("createdAt", "desc")
      .limit(40)
      .get();

    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (city) items = items.filter((item) => String(item.city || "").toLowerCase().includes(city));
    if (vibe) items = items.filter((item) => String(item.vibe || "").toLowerCase() === vibe);

    return Response.json({ adventures: items.map((item) => ({
      id: item.id,
      title: item.title || "Offbeat adventure",
      tagline: item.tagline || "A little adventure, close to home.",
      city: item.city || "",
      vibe: item.vibe || "",
      duration: item.duration || "",
      distance: item.distance ?? null,
      companion: item.companion || "",
      stops: Array.isArray(item.stops) ? item.stops : [],
      shareId: item.shareId || item.id,
    })) });
  } catch (error) {
    console.error("Community feed error:", error);
    return Response.json({ error: "Could not load the community right now." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const shareId = String(body?.shareId || "").trim();
    if (!/^[A-Za-z0-9_-]{8,32}$/.test(shareId)) {
      return Response.json({ error: "Paste a valid Offbeat share link." }, { status: 400 });
    }

    const db = getAdminDb();
    const shared = await db.collection("shared_adventures").doc(shareId).get();
    if (!shared.exists) return Response.json({ error: "That shared adventure could not be found." }, { status: 404 });

    const data = shared.data() || {};
    const adventure = data.adventure || {};
    const existing = await db.collection("community_adventures").doc(shareId).get();
    if (existing.exists) return Response.json({ alreadyExists: true, id: shareId });

    await db.collection("community_adventures").doc(shareId).set({
      title: adventure.title || "Offbeat adventure",
      tagline: adventure.tagline || "",
      city: data.city || "",
      vibe: data.vibe || "",
      duration: data.duration || adventure.duration || "",
      distance: data.distance ?? null,
      companion: data.companion || "",
      stops: Array.isArray(adventure.stops) ? adventure.stops.map((stop) => ({
        name: stop?.name || "",
        description: stop?.description || "",
      })) : [],
      shareId,
      submittedBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ success: true, id: shareId });
  } catch (error) {
    console.error("Community spotlight error:", error);
    const status = error?.message?.includes("Sign in") ? 401 : 500;
    return Response.json({ error: status === 401 ? error.message : "Could not spotlight this adventure." }, { status });
  }
}
