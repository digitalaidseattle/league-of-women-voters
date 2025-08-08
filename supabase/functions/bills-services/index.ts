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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/bills-services' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";
  const { method } = req;

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const biennium = url.searchParams.get("biennium");
    const documentClass = url.searchParams.get("documentClass");

    if (!biennium || !documentClass) {
      return new Response(JSON.stringify({ error: "Missing biennium or documentClass query parameter" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      });
    }

    const apiUrl = `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(biennium)}&documentClass=${encodeURIComponent(documentClass)}`;

    const response = await fetch(apiUrl);
    console.log("External API status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch from WA Legislative API. Status: ${response.status}`);
    }

    const xml = await response.text();
    console.log("Fetched XML sample:", xml.slice(0, 300));

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
    });

    const json = parser.parse(xml);
    const documents = json.ArrayOfLegislativeDocument?.LegislativeDocument ?? [];

    return new Response(JSON.stringify(documents), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    console.error("Error in edge function:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }
});