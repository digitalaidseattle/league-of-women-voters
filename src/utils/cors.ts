// src/utils/cors.ts

export function handleCors(req: Request): Response | null {
    const origin = req.headers.get("origin") || "*";
  
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, apikey, x-client-info",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
  
    // null = not a preflight request
    return null;
  }
  