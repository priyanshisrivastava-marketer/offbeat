import { randomBytes } from "crypto";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function makeShareId() {
  return randomBytes(9).toString("base64url");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { adventure, city, vibe, companion, duration, distance } = body || {};

    if (!adventure || !Array.isArray(adventure.stops) || !adventure.stops.length) {
      return Response.json({ error: "A valid adventure is required." }, { status: 400 });
    }

    const db = getAdminDb();
    let id = makeShareId();
    const ref = db.collection("shared_adventures").doc(id);

    await ref.set({
      adventure: {
        title: adventure.title || "Your Offbeat adventure",
        tagline: adventure.tagline || "",
        duration: adventure.duration || duration || "",
        stops: adventure.stops.map((stop) => ({
          name: stop?.name || "",
          description: stop?.description || "",
        })),
      },
      city: city || "",
      vibe: vibe || "",
      companion: companion || "",
      duration: duration || adventure.duration || "",
      distance: Number.isFinite(Number(distance)) ? Number(distance) : null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ id, url: `/share?id=${encodeURIComponent(id)}` });
  } catch (error) {
    console.error("Share adventure error:", error);
    return Response.json({ error: "Could not create a share link. Please try again." }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id || !/^[A-Za-z0-9_-]{8,32}$/.test(id)) {
      return Response.json({ error: "Invalid share link." }, { status: 400 });
    }

    const snapshot = await getAdminDb().collection("shared_adventures").doc(id).get();
    if (!snapshot.exists) {
      return Response.json({ error: "This adventure could not be found." }, { status: 404 });
    }

    const data = snapshot.data() || {};
    return Response.json({
      adventure: data.adventure || null,
      city: data.city || "",
      vibe: data.vibe || "",
      companion: data.companion || "",
      duration: data.duration || "",
      distance: data.distance ?? null,
    });
  } catch (error) {
    console.error("Load shared adventure error:", error);
    return Response.json({ error: "Could not open this adventure." }, { status: 500 });
  }
}
