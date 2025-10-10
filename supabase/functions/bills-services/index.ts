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
import { ServiceWorker } from "../types.ts";

type GetAllDocumentsParams = {
  biennium: string;
  documentClass: string;
};

class GetAllDocumentsByClass implements ServiceWorker<GetAllDocumentsParams>{
  validate(params: GetAllDocumentsParams) {
    if (
      ((!params.biennium || !params.documentClass))
    ) {
      throw new Error(
        `Missing required parameters: biennium, documentClass,`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl (params: GetAllDocumentsParams): string {
    return `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${encodeURIComponent(
        params.biennium,
      )}&documentClass=${encodeURIComponent(params.documentClass)}`
  };

  getEntities (json: any):any {
    return json["ArrayOfLegislativeDocument"]["LegislativeDocument"];
  };
  
}
function getWorker(params: GetAllDocumentsParams) {
       return new GetAllDocumentsByClass();
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

  try {
     const params = await req.json();
 
     const worker = getWorker(params);
 
     worker.validate(params);
     
     const url = worker.getLegUrl(params);
     const response = await fetch(url);
     const xmlText = await response.text();
     
     const parser = new XMLParser();
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
        status:statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      },
    );
  }
});