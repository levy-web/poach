import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";
const apiHost = (() => {
  try {
    return new URL(apiBaseUrl);
  } catch {
    return new URL("http://localhost:8000");
  }
})();

// True when media is served by a Django running on this machine. Keyed off
// the actual API host rather than NODE_ENV, because `next build && next start`
// runs in production mode while still pointing at localhost — gating on
// NODE_ENV would break images in exactly that setup.
const apiIsLocal = ["localhost", "127.0.0.1", "::1"].includes(apiHost.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Uploaded dish photos, served by whichever host runs the API.
      {
        protocol: apiHost.protocol.replace(":", "") as "http" | "https",
        hostname: apiHost.hostname,
        port: apiHost.port,
        pathname: "/media/**",
      },
    ],
    // Next refuses to optimize images whose host resolves to a private IP.
    // Enabled only when the API really is local — leaving it on against a
    // remote API would let a crafted URL make the optimizer fetch internal
    // addresses (SSRF).
    dangerouslyAllowLocalIP: apiIsLocal,
  },
};

export default nextConfig;
