import { cookies } from "next/headers";
import { checkRateLimit, getClientKey, rateLimitResponse } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the adventure engine for "Offbeat," an app that generates spontaneous local micro-adventures.

You will be given a city, a time budget (1–2 hours, 3–4 hours, Half day, or Full day), a vibe, who it's for (Solo, Friends group, Partner, or Family), and a list of real nearby places. Build a specific local adventure that fits the requested time budget using ONLY places from the provided list. Do not invent place names. If the list is short, use fewer stops rather than inventing.

For 1–2 hours, keep it compact with 1-2 nearby stops. For 3–4 hours, use a small sequence of 2-4 stops. For Half day, create a relaxed multi-stop experience. For Full day, create a fuller itinerary with enough variety and sensible pacing. Never claim that a route takes longer or shorter than the requested time budget.

Tailor the experience to the requested vibe. Food should focus on restaurants, cafes, bakeries, food markets, street food or distinctive local food experiences. Chill should feel calm and unhurried. Social should feel lively and shareable. Adventurous should prioritize active or unusual experiences. Creative should emphasize art, making, design, culture or visually interesting places. Shopping should prioritize markets, boutiques, local stores, street shopping or distinctive retail experiences from the provided list.

Tailor tone to who it's for: Solo trips more introspective/exploratory; Friends group trips social/shareable; Partner trips a little romance or novelty; Family trips safe and multi-age-friendly.

Output ONLY valid JSON, no markdown fences, no prose, in this exact shape:
{
  "title": "short punchy adventure name, 3-6 words",
  "tagline": "one sentence hook, playful tone",
  "duration": "exact requested time budget",
  "stops": [{"name": "exact name from the provided list", "description": "1 sentence, specific and vivid"}],
  "vibe_line": "one closing sentence tying it to the requested vibe and company"
}`;

export async function POST(req) {
  try {
    const { city, duration, vibe, companion, places } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "Missing GEMINI_API_KEY on the server" }, { status: 500 });
    if (!city || !duration || !vibe || !companion) {
      return Response.json({ error: "City, time, vibe and companion are required" }, { status: 400 });
    }

    const rate = checkRateLimit(getClientKey(req, "adventure"));
    if (!rate.allowed) return rateLimitResponse(rate);

    const requestCookies = await cookies();
    const cookieVibe = requestCookies.get("offbeat_vibe")?.value;
    const effectiveVibe = ["Food", "Chill", "Social", "Adventurous", "Creative", "Shopping"].includes(cookieVibe) ? cookieVibe : vibe;
    const placesList = (places || []).map((place) => `${place.name} (${place.address})`).join("\n");
    const userPrompt = `City: ${city}. Time budget: ${duration}. Vibe: ${effectiveVibe}. Who it's for: ${companion}.\n\nReal nearby places to choose from:\n${placesList || "No places found."}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    const data = await res.json();
    if (data.error) return Response.json({ error: data.error.message || "Gemini API error" }, { status: 502 });

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";
    if (!text) return Response.json({ error: "Empty response from Gemini" }, { status: 502 });

    let clean = text.replace(/```json|```/g, "").trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) clean = clean.slice(firstBrace, lastBrace + 1);
    clean = clean.replace(/,(\s*[}\]])/g, "$1");

    try {
      return Response.json({ adventure: JSON.parse(clean) });
    } catch (parseError) {
      return Response.json({ error: `Could not parse the adventure. Please try again. (${parseError.message})` }, { status: 502 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
