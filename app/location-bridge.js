"use client";

import { useEffect } from "react";

const LAT_COOKIE = "offbeat_lat";
const LNG_COOKIE = "offbeat_lng";
const MAX_AGE = 1800;

function setLocationCookie(latitude, longitude) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LAT_COOKIE}=${encodeURIComponent(latitude)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  document.cookie = `${LNG_COOKIE}=${encodeURIComponent(longitude)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function clearLocationCookie() {
  document.cookie = `${LAT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  document.cookie = `${LNG_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export default function LocationBridge() {
  useEffect(() => {
    const attached = new WeakSet();

    const attach = () => {
      const button = document.querySelector('[aria-label="Use my current location"]');
      const cityInput = document.querySelector("#city");
      if (!button || attached.has(button) || !navigator.geolocation) return;

      const handleLocate = () => {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => setLocationCookie(coords.latitude, coords.longitude),
          () => {},
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
        );
      };

      const handleManualCityChange = () => clearLocationCookie();

      button.addEventListener("click", handleLocate);
      cityInput?.addEventListener("input", handleManualCityChange);
      attached.add(button);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
