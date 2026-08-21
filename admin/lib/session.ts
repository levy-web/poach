import "server-only";
import { cookies, headers } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const ACCESS_TOKEN_MAX_AGE = 30 * 60; // 30 minutes, matches SIMPLE_JWT ACCESS_TOKEN_LIFETIME
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME

/**
 * Whether to mark the session cookies `Secure`.
 *
 * Keyed off the scheme the request actually arrived on rather than
 * NODE_ENV: a production build served over plain HTTP — `next start` on
 * localhost, or a container behind a TLS-terminating load balancer — would
 * otherwise emit `Secure` cookies. Safari refuses to store those over http
 * (unlike Chrome, which exempts localhost), leaving the browser with no
 * session at all so every navigation bounces back to /login.
 *
 * `proxy.ts` normalizes `x-forwarded-proto` for us, so it is set whether or
 * not a real reverse proxy is in front.
 */
async function useSecureCookies() {
  const proto = (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim();
  // Only fall back to NODE_ENV if the header is somehow absent, so an
  // unexpected request path still errs toward the stricter flag.
  return proto ? proto === "https" : process.env.NODE_ENV === "production";
}

export async function createSession(tokens: { access: string; refresh: string }) {
  const cookieStore = await cookies();
  const base = {
    httpOnly: true,
    secure: await useSecureCookies(),
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
