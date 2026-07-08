import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare quick-tunnel domain for Hot Module Reloading (HMR) WS connection
  // Note: Since quick-tunnels give you a random URL every time, if you stop and restart
  // the 'cloudflared' tunnel, you must update this string with the new domain.
  allowedDevOrigins: [
    "owner-reactions-photos-classified.trycloudflare.com",
    "shoulder-wisdom-rescue-ceremony.trycloudflare.com",
  ],
};

export default nextConfig;
