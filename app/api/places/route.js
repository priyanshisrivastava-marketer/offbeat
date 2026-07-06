import { createClient } from "@supabase/supabase-js";
const VIBE_KEYWORDS = {
  Chill: "cozy cafe park quiet spot",
  Social: "popular bar rooftop lively spot",
  Adventurous: "hiking trail unique outdoor activity",
  Creative: "art gallery museum workshop studio",
};

export async function POST(req) {
  try {
   
    const authHeader = req.headers.get("authorization");

if (!authHeader?.startsWith("Bearer ")) {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const token = authHeader.slice(7);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser(token);

if (authError || !user) {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
     const { city, vibe } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Missing GOOGLE_PLACES_API_KEY on the server" }, { status: 500 });
    }
    if (!city) {
      return Response.json({ error: "City is required" }, { status: 400 });
    }

    const query = `${VIBE_KEYWORDS[vibe] || "interesting things to do"} in ${city}`;

    // Uses the newer Places API (Text Search), which works with Google's
    // no-billing-required "Maps Demo Key" as well as standard keys.
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 8 }),
    });

    const data = await res.json();

    if (data.error) {
      return Response.json({ error: `Google Places error: ${data.error.message}` }, { status: 502 });
    }

    const places = (data.places || []).map((p) => ({
      name: p.displayName?.text || "Unknown",
      address: p.formattedAddress || "",
      rating: p.rating || null,
    }));

    return Response.json({ places });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
