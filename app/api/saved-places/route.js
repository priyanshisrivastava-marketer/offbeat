import { NextResponse } from "next/server";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { getAuthenticatedUser } from "../../../lib/verifyFirebaseToken";

export async function GET(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snapshot = await getAdminDb()
      .collection("users").doc(user.uid).collection("saved_places")
      .orderBy("savedAt", "desc").get();
    return NextResponse.json({ items: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), savedAt: doc.data().savedAt?.toDate?.()?.toISOString() || null })) });
  } catch (error) {
    console.error("Could not load saved places:", error);
    return NextResponse.json({ error: "Could not load saved places." }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Place name is required." }, { status: 400 });
    const key = String(body.placeId || name).trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
    const data = {
      placeId: body.placeId ? String(body.placeId) : null,
      name,
      city: body.city ? String(body.city) : null,
      description: body.description ? String(body.description) : null,
      address: body.address ? String(body.address) : null,
      mapsUrl: body.mapsUrl ? String(body.mapsUrl) : null,
      photoUrl: body.photoUrl ? String(body.photoUrl) : null,
      savedAt: new Date(),
    };
    await getAdminDb().collection("users").doc(user.uid).collection("saved_places").doc(key).set(data, { merge: true });
    return NextResponse.json({ success: true, id: key, item: data });
  } catch (error) {
    console.error("Could not save place:", error);
    return NextResponse.json({ error: "Could not save this place right now." }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Place id is required." }, { status: 400 });
  try {
    await getAdminDb().collection("users").doc(user.uid).collection("saved_places").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete saved place:", error);
    return NextResponse.json({ error: "Could not remove this place right now." }, { status: 500 });
  }
}
