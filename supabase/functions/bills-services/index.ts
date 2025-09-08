// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:



*/
// supabase/functions/bills-services/index.ts
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
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

  try {
    // Accept query params for GET or JSON body for POST
    let biennium: string | null = null;
    let documentClass: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      biennium = url.searchParams.get("biennium");
      documentClass = url.searchParams.get("documentClass");
    } else if (req.method === "POST") {
      const body = await req.json();
      biennium = body.biennium;
      documentClass = body.documentClass;
    }

    if (!biennium || !documentClass) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: biennium, documentClass" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
          },
        }
      );
    }

    // Build request URL
    const wsUrl = `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(
      biennium
    )}&documentClass=${encodeURIComponent(documentClass)}`;

    // Fetch XML response
    const response = await fetch(wsUrl);
    if (!response.ok) {
      throw new Error(`Upstream request failed: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const json = parser.parse(xmlText);

    // Extract LegislativeDocument array
    const entities =
      json?.ArrayOfLegislativeDocument?.LegislativeDocument || [];

    return new Response(JSON.stringify(entities), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    console.error("SOAP request failed:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }
});