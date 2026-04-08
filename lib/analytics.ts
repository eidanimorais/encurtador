import { createHash } from "node:crypto";

function parseDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile")) return "mobile";
  if (ua.includes("tablet")) return "tablet";
  return "desktop";
}

function parseBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  return "Outro";
}

function parseOs(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Outro";
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
}

export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { device: null, browser: null, os: null };
  }

  return {
    device: parseDevice(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
  };
}
