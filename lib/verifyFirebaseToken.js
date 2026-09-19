import { adminAuth } from "./firebaseAdmin";

export async function getAuthenticatedUser(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
