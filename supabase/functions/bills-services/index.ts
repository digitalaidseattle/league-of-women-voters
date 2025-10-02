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
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";

// Extract inputs from request body (POST)
async function extractInputs(req: Request) {
  const body = await req.json();
  const { biennium, documentClass } = body;

  if (!biennium || !documentClass) {
    throw new Error(`Missing required parameters: biennium, documentClass`,
      {cause: "BadRequest"},
      );
  }
  return { biennium, documentClass };
}


function getLegUrl({ biennium, documentClass }: { biennium: string; documentClass: string }) {
  return `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(
    biennium,
  )}&documentClass=${encodeURIComponent(documentClass)}`;
}

// Add `url` field to each LegislativeDocument object
function addUrlToEntities(entities: object[]) {
  if (!Array.isArray(entities)) return entities;

  return entities.map((doc) => {
    // Some XML->JSON conversions may return primitive strings, It's a guard for it
    const name = (doc?.Name ?? doc?.name ?? "") + "";
    const biennium = (doc?.Biennium ?? doc?.biennium ?? "") + "";

    // Extract the first 4 chars of biennium if possible (e.g., "2025-26" -> "2025")
    const year = typeof biennium === "string" && biennium.length >= 4 ? biennium.slice(0, 4) : "2025";

    // Build the BillSummary URL and encode components
    const billNumber = encodeURIComponent(name);
    const yearEncoded = encodeURIComponent(year);

    const Url = `https://app.leg.wa.gov/BillSummary/?BillNumber=${billNumber}&Year=${yearEncoded}&Initiative=false`;

    // Return a shallow copy of the original doc with the new `url` field
    return { ...doc, Url };
  });
}

Deno.serve(async (req) => {
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

  const parser = new XMLParser();

  try {

    const { biennium, documentClass } = await extractInputs(req);

  
    const response = await fetch(
     getLegUrl({biennium, documentClass}),{
        method: "GET",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          "SOAPAction":
            "https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Upstream request failed with status ${response.status}`);
    }

    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    
    const rawDocs =
      json?.ArrayOfLegislativeDocument?.LegislativeDocument ?? [];

   
    const docsArray = Array.isArray(rawDocs) ? rawDocs : [rawDocs].filter(Boolean);

    // Add url field to each object
    const docsWithUrl = addUrlToEntities(docsArray);

    return new Response(JSON.stringify(docsWithUrl), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    console.error("SOAP request failed:", err);
    const statusCode = err.cause === "BadRequest" ? 400 : 500;
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      },
    );
  }
});