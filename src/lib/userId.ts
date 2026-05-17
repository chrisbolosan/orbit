import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "orbit_uid";
const MAX_AGE = 60 * 60 * 24 * 365 * 5; // 5 years

export function getUserId(): string {
  const store = cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  // New user — generate ID (will be set in the response)
  return uuidv4();
}

export function ensureUserIdCookie(response: Response, userId: string): Response {
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${userId}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax; HttpOnly`
  );
  return response;
}

export { COOKIE_NAME };
