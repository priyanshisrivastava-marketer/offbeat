import { getAdminAuth } from "./firebaseAdmin";

export async function getAuthenticatedUser(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
