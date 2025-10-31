import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { ServiceWorker } from "../types.ts";

type SponsorParams = {
  biennium?: string;
};

class SponsorWorker implements ServiceWorker<SponsorParams>{

  validate(params: SponsorParams) {
    if (
      (!params.biennium)
    ) {
      throw new Error(
        `agency and committeeName are required for operation ${params.biennium}`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: SponsorParams) : string {
    return `https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetSponsors?biennium=${encodeURIComponent(params.biennium)}`;
   
  }

  getEntities(json: any) : any {
      return json["ArrayOfMember"]["Member"];
  }

}
function getWorker(_params: SponsorParams): ServiceWorker<SponsorParams> {
    return new SponsorWorker();
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
    throw err;
  }
});
