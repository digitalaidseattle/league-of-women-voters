import { ServiceWorker } from "../types.ts";


type LegislatorParams = {
  biennium?: string;
};

class LegislatorWorker implements ServiceWorker<LegislatorParams> {

  validate(params: LegislatorParams) {

  }

  getLegUrl(params: LegislatorParams): string {
    return `https://v3.openstates.org/people?apikey=${API_KEY}&jurisdiction=${JURISDITION}&per_page=${PAGE_SIZE}`;
  }

  getEntities(json: any): any {
    console.log(json);
    return json;
  }

}

function getWorker(_params: LegislatorParams): ServiceWorker<LegislatorParams> {
  return new LegislatorWorker();
}

const API_KEY = Deno.env.get('OPEN_STATES_API_KEY'); //'5c509f44-a7aa-4024-b2f5-615bfb01d81b';
const JURISDITION = 'ocd-jurisdiction/country:us/state:wa/government';
const PAGE_SIZE = 50;

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

    let all: any[] = [];

    // TODO figure out looping
    // Calling 3 times because max-page is 50 and WA leg has 148 reps.
    for (let page = 1; page <= 3; page++) {
      let resp = await fetch(`https://v3.openstates.org/people?apikey=${API_KEY}&jurisdiction=${JURISDITION}&per_page=${PAGE_SIZE}&page=${page}`);
      let json = await resp.json();
      all = all.concat(json.results);
    }

    return new Response(JSON.stringify(all), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    console.error("SOAP request failed:", err);
    throw err;
  }
});
