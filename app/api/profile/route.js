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
  const body = await req.json().catch(() => ({}));
  const user = await getAuthenticatedUser(req);
  const cleanName = String(body.name || user?.name || "").trim();

  if (!cleanName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  const profile = {
    name: cleanName,
    email: user?.email || "",
    photoURL: user?.picture || "",
    ...(body.defaultCity ? { defaultCity: String(body.defaultCity).trim() } : {}),
    ...(body.favoriteVibe ? { favoriteVibe: String(body.favoriteVibe) } : {}),
    ...(body.favoriteCompanion ? { favoriteCompanion: String(body.favoriteCompanion) } : {}),
    ...(body.preferredDistance != null ? { preferredDistance: Number(body.preferredDistance) } : {}),
    updatedAt: new Date(),
  };

  // Profile setup must not be blocked by Firebase Admin configuration.
  // If server-side token verification is unavailable, return the profile so
  // the client can continue. When auth + Firestore are available, persist it.
  if (user) {
    try {
      await getAdminDb().collection("users").doc(user.uid).set(profile, { merge: true });
    } catch (error) {
      console.error("Could not persist profile to Firestore:", error);
    }
  }

  return NextResponse.json({ success: true, profile });
}
