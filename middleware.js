import { NextResponse } from "next/server";

function decodeFirebaseToken(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request) {
  if (request.method !== "GET" || request.nextUrl.pathname !== "/api/profile") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // This GET response is only a fast client-side fallback for the profile screen.
  // Authorization and writes remain protected by Firebase Admin in the API route.
  const claims = decodeFirebaseToken(authHeader.slice(7));
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    profile: {
      name: claims.name || "",
      email: claims.email || "",
      photoURL: claims.picture || "",
    },
  });
}

export const config = {
  matcher: "/api/profile",
};
