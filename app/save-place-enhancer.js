"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseClient";

function placePayload(stop) {
  const strong = stop.querySelector("strong");
  const map = stop.querySelector('a[href*="google.com/maps"]');
  const description = stop.querySelector("p");
  if (!strong) return null;
  const name = strong.textContent.trim();
  if (!name) return null;
  return {
    name,
    description: description?.textContent?.trim() || null,
    mapsUrl: map?.href || null,
  };
}

export default function SavePlaceEnhancer() {
  useEffect(() => {
    let currentUser = null;
    let active = true;
    const observer = new MutationObserver(() => enhance());

    const addButton = (stop) => {
      if (!currentUser || stop.querySelector("[data-offbeat-save-place]")) return;
      const payload = placePayload(stop);
      if (!payload) return;

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.offbeatSavePlace = "true";
      button.textContent = "♡ Save place";
      Object.assign(button.style, {
        marginTop: "8px",
        border: "1px solid #ded9cf",
        background: "#fff",
        color: "#17191d",
        borderRadius: "999px",
        padding: "8px 11px",
        fontSize: ".76rem",
        fontWeight: "800",
        cursor: "pointer",
      });

      button.addEventListener("click", async () => {
        if (!currentUser || button.disabled) return;
        button.disabled = true;
        const original = button.textContent;
        button.textContent = "Saving…";
        try {
          const token = await Promise.race([
            currentUser.getIdToken(),
            new Promise((_, reject) => window.setTimeout(() => reject(new Error("token-timeout")), 5000)),
          ]);
          const response = await fetch("/api/saved-places", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Could not save this place.");
          button.textContent = "✓ Saved";
          button.style.background = "#17191d";
          button.style.color = "#fff";
        } catch (error) {
          console.error("Could not save place:", error);
          button.textContent = original;
          button.disabled = false;
        }
      });

      stop.appendChild(button);
    };

    function enhance() {
      if (!active || !currentUser) return;
      document.querySelectorAll(".stop").forEach(addButton);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) enhance();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    enhance();

    return () => {
      active = false;
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  return null;
}
