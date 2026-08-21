import "server-only";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const ACCESS_TOKEN_MAX_AGE = 30 * 60; // 30 minutes, matches SIMPLE_JWT ACCESS_TOKEN_LIFETIME
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME

export async function createSession(tokens: { access: string; refresh: string }) {
  const cookieStore = await cookies();
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
