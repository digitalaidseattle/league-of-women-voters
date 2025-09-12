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

async function extractInputs(req: Request) {
  const body = await req.json();
  const { biennium, documentClass } = body;

  if (!biennium || !documentClass) {
    throw new Error(`Missing required parameters: biennium, documentClass,
      {cause: "BadRequest"},
      `);
  }

  return { biennium, documentClass };
}

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

  const parser = new XMLParser();

  try {
    // 🔹 Extract inputs using helper
    const { biennium, documentClass } = await extractInputs(req);

    const response = await fetch(
      `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(
        biennium,
      )}&documentClass=${encodeURIComponent(documentClass)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          "SOAPAction":
            "https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass",
        },
      },
    );

    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    // Extract LegislativeDocument list
    const docs = json["ArrayOfLegislativeDocument"]["LegislativeDocument"];

    return new Response(JSON.stringify(docs), {
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
        status:statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      },
    );
  }
});