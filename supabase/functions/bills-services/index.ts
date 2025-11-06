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


type GetAllDocumentsParams = {
  biennium: string;
  documentClass: string;
};

class GetAllDocumentsByClass implements ServiceWorker<GetAllDocumentsParams> {
  validate(params: GetAllDocumentsParams) {
    if (!params.biennium || !params.documentClass) {
      throw new Error(
        `Missing required parameters: biennium, documentClass`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: GetAllDocumentsParams): string {
    return `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(
      params.biennium,
    )}&documentClass=${encodeURIComponent(params.documentClass)}`;
  }

  // Parse JSON, normalize array, and add Url field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntities(json: any): any {
    const rawDocs =
      json?.ArrayOfLegislativeDocument?.LegislativeDocument ?? [];
    const docsArray = Array.isArray(rawDocs)
      ? rawDocs
      : [rawDocs].filter(Boolean);

    return docsArray.map((doc) => {
      const name = (doc?.Name ?? doc?.name ?? "") + "";
      const biennium = (doc?.Biennium ?? doc?.biennium ?? "") + "";

      // Extract year from biennium, e.g. "2025-26" → "2025"
      const year =
        typeof biennium === "string" && biennium.length >= 4
          ? biennium.slice(0, 4)
          : "2025";

      const billNumber = encodeURIComponent(name);
      const yearEncoded = encodeURIComponent(year);

      const Url = `https://app.leg.wa.gov/BillSummary/?BillNumber=${billNumber}&Year=${yearEncoded}&Initiative=false`;

      return { ...doc, Url };
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getWorker(params: GetAllDocumentsParams) {
  return new GetAllDocumentsByClass();
}

// Global XML parser (removeNSPrefix to avoid namespace issues)
const parser = new XMLParser({ removeNSPrefix: true });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle CORS preflight
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
    const params = await req.json();
    const worker = getWorker(params);

    worker.validate(params);

    const url = worker.getLegUrl(params);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream request failed with status ${response.status}`);
    }

    const xmlText = await response.text();
    const json = parser.parse(xmlText);
    const entities = worker.getEntities(json);

    return new Response(JSON.stringify(entities), {
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