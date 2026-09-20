"use client";

import { useEffect } from "react";

function decodeAdventure(value) {
  try {
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function shortenOffbeatUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin || parsed.pathname !== "/share") return url;

    const encoded = parsed.searchParams.get("a");
    if (!encoded) return url;

    const adventure = decodeAdventure(encoded);
    if (!adventure?.stops?.length) return url;

    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adventure,
        city: adventure.city || "",
        vibe: adventure.vibe || "",
        companion: adventure.companion || "",
        duration: adventure.duration || "",
        distance: adventure.distance ?? null,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) return url;
    return `${window.location.origin}/share?id=${encodeURIComponent(data.id)}`;
  } catch {
    return url;
  }
}

export default function ShareLinkFix() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return undefined;

    const originalShare = navigator.share?.bind(navigator);
    const originalWriteText = navigator.clipboard?.writeText?.bind(navigator.clipboard);

    if (originalShare) {
      try {
        navigator.share = async (data) => {
          if (!data?.url) return originalShare(data);
          const shortUrl = await shortenOffbeatUrl(data.url);
          return originalShare({ ...data, url: shortUrl });
        };
      } catch {}
    }

    if (originalWriteText) {
      try {
        navigator.clipboard.writeText = async (text) => {
          const shortUrl = typeof text === "string" ? await shortenOffbeatUrl(text) : text;
          return originalWriteText(shortUrl);
        };
      } catch {}
    }

    return () => {
      try { if (originalShare) navigator.share = originalShare; } catch {}
      try { if (originalWriteText) navigator.clipboard.writeText = originalWriteText; } catch {}
    };
  }, []);

  return null;
}
