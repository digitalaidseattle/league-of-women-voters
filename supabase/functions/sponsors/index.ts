import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { ServiceWorker } from "../types.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";

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
    return corsResponse(origin);
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

    return standardResponse(origin, JSON.stringify(entities));
  } catch (err) {
    return errorResponse(origin, err);
  }
});
