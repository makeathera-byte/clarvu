import { NextRequest } from "next/server";

/**
 * Get country code from request
 * Tries multiple methods:
 * 1. Vercel/Cloudflare headers (production)
 * 2. IP-based geolocation API (fallback)
 */
export async function getCountryFromRequest(request: NextRequest): Promise<string> {
  // Method 1: Check for Vercel/Cloudflare headers (fastest, no API call needed)
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const cloudflareCountry = request.headers.get("cf-ipcountry");
  
  if (vercelCountry) {
    return vercelCountry;
  }
  
  if (cloudflareCountry) {
    return cloudflareCountry;
  }

  // Method 2: Get IP address and use geolocation API
  try {
    const ip = getClientIP(request);
    
    if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::1") || ip === "localhost") {
      // Localhost or invalid IP
      return "unknown";
    }

    // Use ipapi.co (free, no API key required for basic usage)
    // Rate limit: 1000 requests/day
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout
    
    try {
      const response = await fetch(`https://ipapi.co/${ip}/country/`, {
        headers: {
          "User-Agent": "DayFlow Analytics",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const country = (await response.text()).trim();
        // ipapi.co returns country code (e.g., "US", "GB") or "Undefined" on error
        if (country && country !== "Undefined" && country.length === 2) {
          return country;
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name !== "AbortError") {
        // Only log non-timeout errors
        console.error("IP geolocation API error:", fetchError.message);
      }
    }
  } catch (error) {
    // Silently fail - don't break visit logging
    console.error("Error getting country from IP:", error);
  }

  return "unknown";
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP (in order of preference)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwarded.split(",").map((ip) => ip.trim());
    return ips[0] || "unknown";
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback: try to get from x-client-ip header
  const ip = request.headers.get("x-client-ip");
  return ip || "unknown";
}

