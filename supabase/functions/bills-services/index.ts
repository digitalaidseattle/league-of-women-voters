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
// src/supabase/functions/bills-services/index.ts

import type { ServiceWorker } from "../types.ts";
import { handleCors } from "../../utils/cors.ts";
import { runService } from "../../utils/service_runner.ts";

type GetAllDocumentsParams = {
  biennium: string;
  documentClass: string;
};

class GetAllDocumentsByClass
  implements ServiceWorker<GetAllDocumentsParams>
{
  validate(params: GetAllDocumentsParams) {
    if (!params.biennium || !params.documentClass) {
      throw new Error(
        `Missing required parameters: biennium, documentClass`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: GetAllDocumentsParams): string {
    return `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetAllDocumentsByClass?biennium=${
      encodeURIComponent(params.biennium)
    }&documentClass=${encodeURIComponent(params.documentClass)}`;
  }

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

      const year =
        typeof biennium === "string" && biennium.length >= 4
          ? biennium.slice(0, 4)
          : "2025";

      const billNumber = encodeURIComponent(name);
      const yearEncoded = encodeURIComponent(year);

      const Url =
        `https://app.leg.wa.gov/BillSummary/?BillNumber=${billNumber}&Year=${yearEncoded}&Initiative=false`;

      return { ...doc, Url };
    });
  }
}

function getWorker(_params: GetAllDocumentsParams) {
  return new GetAllDocumentsByClass();
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  return runService<GetAllDocumentsParams>(req, getWorker);
});
