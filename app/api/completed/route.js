import { NextResponse } from "next/server";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { getAuthenticatedUser } from "../../../lib/verifyFirebaseToken";

export async function GET(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await getAdminDb()
      .collection("users")
      .doc(user.uid)
      .collection("completed_adventures")
      .orderBy("completedAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Could not load completed adventures:", error);
    return NextResponse.json(
      { error: "Could not load completed adventures." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, city, vibe, companion, duration, distance, tagline, stops } = body;

    if (!title || !city || !vibe || !companion || !Array.isArray(stops)) {
      return NextResponse.json(
        { error: "Incomplete adventure data." },
        { status: 400 }
      );
    }

    const docRef = await getAdminDb()
      .collection("users")
      .doc(user.uid)
      .collection("completed_adventures")
      .add({
        title,
        city,
        vibe,
        companion,
        duration: duration || null,
        distance: Number.isFinite(Number(distance)) ? Number(distance) : null,
        tagline: tagline || null,
        stops,
        completedAt: new Date(),
      });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Could not save completed adventure:", error);
    return NextResponse.json(
      { error: "Could not save this adventure right now. Please try again." },
      { status: 500 }
    );
  }
}
