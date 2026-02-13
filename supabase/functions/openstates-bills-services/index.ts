/* eslint-disable @typescript-eslint/no-explicit-any */
const API_KEY = Deno.env.get("OPEN_STATES_API_KEY");

const JURISDICTION = "ocd-jurisdiction/country:us/state:wa/government";

const PAGE_SIZE = 20;
const DEFAULT_PAGES = 8;
const REQUEST_DELAY = 6500;

// ✅ Include all headers that Supabase client sends
const ALLOWED_HEADERS = "authorization, x-client-info, apikey, content-type";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildUrl(identifier?: string, session?: string) {
  if (!identifier || !session) return null;
  const billNumber = identifier.split(" ").pop();
  const year = session.slice(0, 4);
  if (!billNumber || !year) return null;

  return `https://app.leg.wa.gov/BillSummary/?BillNumber=${encodeURIComponent(
    billNumber,
  )}&Year=${encodeURIComponent(year)}&Initiative=false`;
}

// ✅ Helper function for consistent CORS headers
function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // ✅ Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  try {
    if (!API_KEY) {
      throw new Error("OPEN_STATES_API_KEY not set");
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { page = 1, limit =  DEFAULT_PAGES } = body;
    const startPage = Number(page);
    const numPages = Number(limit);
    const endPage = startPage + numPages - 1;

    const allBills: any[] = [];

    for (let p = startPage; p <= endPage; p++) {
      const url = `https://v3.openstates.org/bills?jurisdiction=${encodeURIComponent(
        JURISDICTION,
      )}&sort=updated_desc&page=${p}&per_page=${PAGE_SIZE}`;

      const resp = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-API-KEY": API_KEY!,
        },
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("OpenStates error body:", text);
        throw new Error(`OpenStates failed ${resp.status}: ${text}`);
      }

      const json = await resp.json();
      const results = json?.results ?? [];

      if (results.length === 0) break;

      const enriched = results.map((bill: any) => ({
        ...bill,
        Url: buildUrl(bill.identifier, bill.session),
      }));

      allBills.push(...enriched);

      // ✅ Only add delay if there are more pages
      if (p < endPage && results.length === PAGE_SIZE) {
        await sleep(REQUEST_DELAY);
      }
    }

    return new Response(JSON.stringify(allBills), {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch (err: any) {
    console.error("Edge function error:", err);

    return new Response(
      JSON.stringify({ 
        error: err.message,
        details: err.stack 
      }), 
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin") || "*"),
      }
    );
  }
});
