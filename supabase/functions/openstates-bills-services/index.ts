/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceWorker } from "../types.ts";

type BillsParams = {
  page?: number;
};

const API_KEY = Deno.env.get("OPEN_STATES_API_KEY");
const JURISDICTION =
  "ocd-jurisdiction/country:us/state:wa/government";
const PAGE_SIZE = 20;

class BillsWorker implements ServiceWorker<BillsParams> {
  validate(_params: BillsParams) {
    if (!API_KEY) {
      throw new Error("Missing OPEN_STATES_API_KEY env var", {
        cause: "BadRequest",
      });
    }
  }

  getLegUrl(params: BillsParams): string {
    const page = params.page ?? 1;
    return `https://v3.openstates.org/bills?jurisdiction=${encodeURIComponent(
      JURISDICTION,
    )}&sort=updated_desc&page=${page}&per_page=${PAGE_SIZE}&apikey=${API_KEY}`;
  }

  getEntities(json: any): any[] {
    const results = json?.results ?? [];

    return results.map((bill: any) => {
      const identifier: string = bill?.identifier ?? "";
      const session: string = bill?.session ?? "";

      // "HB 1091" -> "1091"
      const billNumber =
        identifier.split(" ").pop() ?? "";

      // "2025-2026" -> "2025"
      const year =
        typeof session === "string" && session.length >= 4
          ? session.slice(0, 4)
          : "";

      const Url = `https://app.leg.wa.gov/BillSummary/?BillNumber=${encodeURIComponent(
        billNumber,
      )}&Year=${encodeURIComponent(year)}&Initiative=false`;

      return {
        ...bill,
        Url,
      };
    });
  }
}

function getWorker(_params: BillsParams): ServiceWorker<BillsParams> {
  return new BillsWorker();
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // CORS preflight
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

    let all: any[] = [];

    // Fetch first 20 pages (OpenStates pagination)
    for (let page = 1; page <= 20; page++) {
      const resp = await fetch(
        worker.getLegUrl({ page }),
        {
          headers: {
            "Accept": "application/json",
          },
        },
      );

      if (!resp.ok) {
        throw new Error(
          `OpenStates request failed: ${resp.status}`,
        );
      }

      const json = await resp.json();
      const entities = worker.getEntities(json);

      all = all.concat(entities);
    }

    return new Response(JSON.stringify(all), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err: any) {
    console.error("OpenStates request failed:", err);

    const status =
      err?.cause === "BadRequest" ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: err.message || "Internal Server Error",
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      },
    );
  }
});