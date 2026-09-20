"use client";

import { useEffect } from "react";

const LAT_COOKIE = "offbeat_lat";
const LNG_COOKIE = "offbeat_lng";
const VIBE_COOKIE = "offbeat_vibe";
const MAX_AGE = 1800;

function setCookie(name, value) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function setLocationCookie(latitude, longitude) {
  setCookie(LAT_COOKIE, latitude);
  setCookie(LNG_COOKIE, longitude);
}

function clearLocationCookie() {
  document.cookie = `${LAT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  document.cookie = `${LNG_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function getCookie(name) {
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}

function setupVibes() {
  const grids = [...document.querySelectorAll('[class*="choiceGrid"]')];
  const vibeGrid = grids.find((grid) => [...grid.querySelectorAll("button")].some((button) => button.textContent.includes("Shopping")) && [...grid.querySelectorAll("button")].some((button) => button.textContent.includes("Creative")));
  if (!vibeGrid) return;

  const foodButton = [...vibeGrid.querySelectorAll("button")].find((button) => button.dataset.offbeatVibe === "food") || [...vibeGrid.querySelectorAll("button")].find((button) => button.textContent.includes("Shopping"));
  if (!foodButton) return;

  foodButton.dataset.offbeatVibe = "food";
  foodButton.textContent = "🍜 Food";

  let shoppingButton = vibeGrid.querySelector('[data-offbeat-vibe="shopping"]');
  if (!shoppingButton) {
    shoppingButton = foodButton.cloneNode(true);
    shoppingButton.dataset.offbeatVibe = "shopping";
    shoppingButton.textContent = "🛍️ Shopping";
    shoppingButton.removeAttribute("aria-pressed");
    shoppingButton.addEventListener("click", (event) => {
      event.preventDefault();
      setCookie(VIBE_COOKIE, "Shopping");
      window.__offbeatShoppingProxy = true;
      foodButton.click();
      window.__offbeatShoppingProxy = false;
      window.setTimeout(() => {
        foodButton.classList.remove("choiceActive");
        shoppingButton.classList.add("choiceActive");
      }, 0);
    });
    vibeGrid.appendChild(shoppingButton);
  }

  if (!getCookie(VIBE_COOKIE)) setCookie(VIBE_COOKIE, "Food");
  const activeVibe = decodeURIComponent(getCookie(VIBE_COOKIE) || "Food");
  foodButton.classList.toggle("choiceActive", activeVibe === "Food");
  shoppingButton.classList.toggle("choiceActive", activeVibe === "Shopping");

  if (!foodButton.dataset.offbeatBound) {
    foodButton.dataset.offbeatBound = "1";
    foodButton.addEventListener("click", () => {
      if (window.__offbeatShoppingProxy) return;
      setCookie(VIBE_COOKIE, "Food");
      foodButton.classList.add("choiceActive");
      shoppingButton.classList.remove("choiceActive");
    });
  }
}

export default function LocationBridge() {
  useEffect(() => {
    const attached = new WeakSet();

    const attach = () => {
      const button = document.querySelector('[aria-label="Use my current location"]');
      const cityInput = document.querySelector("#city");
      if (button && !attached.has(button) && navigator.geolocation) {
        const handleLocate = () => {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => setLocationCookie(coords.latitude, coords.longitude),
            () => {},
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
          );
        };
        button.addEventListener("click", handleLocate);
        attached.add(button);
      }

      if (cityInput && !attached.has(cityInput)) {
        cityInput.addEventListener("input", clearLocationCookie);
        attached.add(cityInput);
      }

      setupVibes();
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
