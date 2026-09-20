import { NextResponse } from "next/server";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { getAuthenticatedUser } from "../../../lib/verifyFirebaseToken";

export async function GET(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await getAdminDb().collection("users").doc(user.uid).get();
    return NextResponse.json({
      profile: snap.exists ? snap.data() : null,
    });
  } catch (error) {
    console.error("Could not load profile:", error);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const profile = {
    name: String(body.name || user.name || "").trim(),
    email: user.email || "",
    photoURL: user.picture || "",
    ...(body.defaultCity ? { defaultCity: String(body.defaultCity).trim() } : {}),
    ...(body.favoriteVibe ? { favoriteVibe: String(body.favoriteVibe) } : {}),
    ...(body.favoriteCompanion ? { favoriteCompanion: String(body.favoriteCompanion) } : {}),
    ...(body.preferredDistance != null ? { preferredDistance: Number(body.preferredDistance) } : {}),
    updatedAt: new Date(),
  };

  // Firestore persistence is useful but should never trap a signed-in user
  // on the profile setup screen. Return the profile even if Firestore is
  // temporarily unavailable or its server-side configuration needs attention.
  try {
    await getAdminDb().collection("users").doc(user.uid).set(profile, { merge: true });
  } catch (error) {
    console.error("Could not persist profile to Firestore:", error);
  }

  return NextResponse.json({ success: true, profile });
}
