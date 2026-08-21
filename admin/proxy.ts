import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_MAX_AGE = 30 * 60; // matches SIMPLE_JWT ACCESS_TOKEN_LIFETIME
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // matches REFRESH_TOKEN_LIFETIME

/**
 * Whether to mark the session cookies `Secure`.
 *
 * Keyed off the scheme the request actually arrived on rather than
 * NODE_ENV: a production build served over plain HTTP — `next start` on
 * localhost, or a container behind a TLS-terminating load balancer — would
 * otherwise emit `Secure` cookies. Safari refuses to store those over http
 * (unlike Chrome, which exempts localhost), leaving the browser with no
 * session at all so every navigation bounces back to /login.
 */
function requestProtocol(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.nextUrl.protocol.replace(":", "");
}

function cookieBase(protocol: string) {
  return {
    httpOnly: true,
    secure: protocol === "https",
    sameSite: "lax" as const,
    path: "/",
  };
}

// Refresh slightly before the token actually lapses, so a token that would
// expire mid-render gets replaced instead of failing the request it's on.
const EXPIRY_LEEWAY_MS = 30_000;

// Access tokens are short-lived (30 min, per SIMPLE_JWT). Decoding the
// payload (no signature check — the backend still verifies that on every
// request) is enough to know whether it's worth attempting a refresh before
// treating the session as gone.
function isExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.exp !== "number" || Date.now() >= decoded.exp * 1000 - EXPIRY_LEEWAY_MS;
  } catch {
    return true;
  }
}

type RefreshResult =
  | { status: "ok"; access: string; refresh: string }
  // The backend rejected the token itself — expired, blacklisted, malformed.
  // This is the *only* condition that means the session is genuinely over.
  | { status: "rejected" }
  // Couldn't reach the backend, or it 5xx'd. We have no idea whether the
  // session is still good, so we must not destroy it on this evidence.
  | { status: "unavailable" };

// Next.js prefetches every visible sidebar <Link> as soon as the shell
// renders, so several requests arrive here concurrently carrying the same
// refresh token cookie. ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION
// means whichever request refreshes first invalidates that token for
// everyone else — without dedup the losers get a spurious "token blacklisted"
// rejection. Sharing one in-flight request per token value fixes that
// (per-process only — fine for a single Node instance, not for scaled-out ones).
const inFlightRefreshes = new Map<string, Promise<RefreshResult>>();

async function refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
  const inFlight = inFlightRefreshes.get(refreshToken);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<RefreshResult> => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      });
    } catch {
      return { status: "unavailable" };
    }

    // Only a 401 means "this refresh token is no good". A 500 or a gateway
    // blip must not be allowed to log the user out.
    if (response.status === 401) return { status: "rejected" };
    if (!response.ok) return { status: "unavailable" };

    try {
      const data = await response.json();
      if (typeof data?.access !== "string") return { status: "unavailable" };
      // ROTATE_REFRESH_TOKENS is on, so the backend issues a new refresh token
      // (and blacklists the old one) alongside the new access token. If
      // rotation is ever turned off, `refresh` is absent and the existing
      // cookie stays valid — keep using it rather than dropping the session.
      return {
        status: "ok",
        access: data.access,
        refresh: typeof data.refresh === "string" ? data.refresh : refreshToken,
      };
    } catch {
      return { status: "unavailable" };
    }
  })();

  inFlightRefreshes.set(refreshToken, promise);
  try {
    return await promise;
  } finally {
    inFlightRefreshes.delete(refreshToken);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  const protocol = requestProtocol(request);
  const COOKIE_BASE = cookieBase(protocol);

  let accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  let refreshed: { access: string; refresh: string } | null = null;
  let refreshRejected = false;

  if (refreshToken && (!accessToken || isExpired(accessToken))) {
    const result = await refreshAccessToken(refreshToken);
    if (result.status === "ok") {
      refreshed = { access: result.access, refresh: result.refresh };
      accessToken = result.access;
    } else {
      refreshRejected = result.status === "rejected";
      accessToken = undefined;
    }
  }

  const hasSession = Boolean(accessToken);

  // Rotation means a refreshed token pair exists only in this request's
  // memory. Every response leaving here has to carry it back to the browser —
  // including redirects. Dropping it on any path strands the browser holding
  // a refresh token the backend has already blacklisted, which turns the very
  // next request into a bogus logout.
  const persistSession = (response: NextResponse) => {
    if (!refreshed) return response;
    response.cookies.set("access_token", refreshed.access, {
      ...COOKIE_BASE,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set("refresh_token", refreshed.refresh, {
      ...COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    return response;
  };

  if (!isPublicPath && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear cookies only when the backend actually rejected the refresh token
    // (expired or already blacklisted). A transient backend outage, or simply
    // arriving with no cookies at all, must never wipe a live session — a
    // single unlucky prefetch would otherwise log the user out everywhere.
    if (refreshRejected) {
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
    }
    return response;
  }

  if (isPublicPath && hasSession) {
    return persistSession(NextResponse.redirect(new URL("/", request.url)));
  }

  if (refreshed) {
    // Forward the new access token on the current request too, so the
    // Server Component render that follows sees a valid session instead of
    // the stale one it arrived with.
    request.cookies.set("access_token", refreshed.access);
    request.cookies.set("refresh_token", refreshed.refresh);
  }

  // Normalize the scheme for downstream Server Actions (`createSession` reads
  // this to decide the `Secure` flag). Preserved as-is when a real reverse
  // proxy already set it; filled in from the request URL otherwise.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-forwarded-proto", protocol);

  return persistSession(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
