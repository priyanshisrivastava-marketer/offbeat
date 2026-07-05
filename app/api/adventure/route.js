const SYSTEM_PROMPT = `You are the adventure engine for "Offbeat," an app that generates spontaneous local micro-adventures.

You will be given a city, a time budget, a vibe, who it's for (Solo, Friends group, Partner, or Family), and a list of real nearby places. Build a specific 2-4 hour micro-adventure using ONLY places from the provided list — do not invent place names. If the list is short, use fewer stops rather than inventing.

Tailor tone to who it's for: Solo trips more introspective/exploratory; Friends group trips social/shareable; Partner trips a little romance or novelty; Family trips safe and multi-age-friendly.

Output ONLY valid JSON, no markdown fences, no prose, in this exact shape:
{
  "title": "short punchy adventure name, 3-6 words",
  "tagline": "one sentence hook, playful tone",
  "duration": "e.g. 3 hours",
  "stops": [{"name": "exact name from the provided list", "description": "1 sentence, specific and vivid"}],
  "vibe_line": "one closing sentence tying it to the requested vibe and company"
}`;

export async function POST(req) {
  try {
    const { city, duration, vibe, companion, places } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Missing GEMINI_API_KEY on the server" }, { status: 500 });
    }

    const placesList = (places || []).map((p) => `${p.name} (${p.address})`).join("\n");
    const userPrompt = `City: ${city}. Time budget: ${duration}. Vibe: ${vibe}. Who it's for: ${companion}.

Real nearby places to choose from:
${placesList || "No places found — invent a plausible generic itinerary instead."}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1500 },
        }),
      }
    );

    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message || "Gemini API error" }, { status: 502 });
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
    if (!text) {
      return Response.json({ error: "Empty response from Gemini" }, { status: 502 });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const adventure = JSON.parse(clean);

    return Response.json({ adventure });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
