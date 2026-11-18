
import { createClient } from "jsr:@supabase/supabase-js@2";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";

// Returns a bill's full history on demand (nothing is cached in the database)
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";
const parser = new XMLParser();

type BillHistoryEntry = {
  ActionDate: string;
  HistoryLine: string;
  Status: string;
};

// Same query as PreferencesDAO.getCurrentBiennium. The shared DAO pulls in
// @digitalaidseattle/supabase and Firebase, which makes this bundle too large to deploy.
async function getCurrentBiennium(): Promise<string> {
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await client
    .from("Preferences")
    .select("biennium")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    throw new Error(`Failed to load Preferences: ${error.message}`);
  }
  return data.biennium as string;
}

async function fetchHistory(biennium: string, billNumber: string): Promise<BillHistoryEntry[]> {
  // A biennium like "2025-26" covers Jan 1, 2025 through Dec 31, 2026
  const startYear = Number(biennium.split("-")[0]);
  const beginDate = `${startYear}-01-01`;
  const endDate = `${startYear + 1}-12-31`;
  const url = `${BASE_URL}/GetLegislativeStatusChangesByBillNumber?biennium=${encodeURIComponent(biennium)}&billNumber=${encodeURIComponent(billNumber)}&beginDate=${beginDate}&endDate=${endDate}`;

  const response = await fetch(url);
  const xml = await response.text();
  const json = parser.parse(xml);
  const statuses = json["ArrayOfLegislativeStatus"]?.["LegislativeStatus"] ?? [];
  // A single entry is parsed as an object, not an array
  return (Array.isArray(statuses) ? statuses : [statuses])
    .map((status: any) => ({
      ActionDate: status.ActionDate,
      HistoryLine: status.HistoryLine,
      Status: String(status.Status ?? "").trim(),
    }));
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    const { billNumber } = await req.json();
    if (!billNumber) {
      throw new Error("billNumber is required", { cause: "BadRequest" });
    }
    const biennium = await getCurrentBiennium();
    const history = await fetchHistory(biennium, String(billNumber));
    return new Response(JSON.stringify(history), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    console.error("Failed to load bill history", err);
    return errorResponse(origin, err);
  }
});
