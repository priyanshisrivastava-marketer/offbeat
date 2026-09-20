import { checkRateLimit, getClientKey, rateLimitResponse } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VIBE_KEYWORDS = {
  Chill: "cozy cafe park quiet spot",
  Social: "popular bar rooftop lively spot",
  Adventurous: "hiking trail unique outdoor activity",
  Creative: "art gallery museum workshop studio",
  Shopping: "local market shopping street boutique independent stores craft market",
};

export async function POST(req) {
  try {
    const { city, vibe, distance, latitude, longitude } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) return Response.json({ error: "Missing GOOGLE_PLACES_API_KEY on the server" }, { status: 500 });
    if (!city && (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)))) {
      return Response.json({ error: "City or valid coordinates are required" }, { status: 400 });
    }

    const rate = checkRateLimit(getClientKey(req, "places"));
    if (!rate.allowed) return rateLimitResponse(rate);

    const selectedDistance = Math.min(30, Math.max(1, Number(distance) || 5));
    const query = `${VIBE_KEYWORDS[vibe] || "interesting things to do"}${city ? ` in ${city}` : " nearby"}`;

    const body = {
      textQuery: query,
      maxResultCount: 8,
    };

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    if (hasCoordinates) {
      body.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: selectedDistance * 1000,
        },
      };
    } else {
      body.textQuery = `${query} within ${selectedDistance} km`;
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) return Response.json({ error: `Google Places error: ${data.error.message}` }, { status: 502 });

    const places = (data.places || []).map((place) => ({
      name: place.displayName?.text || "Unknown",
      address: place.formattedAddress || "",
      rating: place.rating || null,
    }));

    return Response.json({ places });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
