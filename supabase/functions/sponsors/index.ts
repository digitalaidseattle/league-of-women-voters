// src/supabase/functions/sponsors/index.ts

import type { ServiceWorker } from "../types.ts";
import { handleCors } from "../../utils/cors.ts";
import { runService } from "../../utils/service_runner.ts";

type SponsorParams = {
  biennium?: string;
};

class SponsorWorker implements ServiceWorker<SponsorParams> {
  validate(params: SponsorParams) {
    if (!params.biennium) {
      throw new Error(
        `biennium is required for sponsor lookup`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: SponsorParams): string {
    return `https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetSponsors?biennium=${
      encodeURIComponent(params.biennium!)
    }`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntities(json: any): any {
    return json["ArrayOfMember"]["Member"];
  }
}

function getWorker(_params: SponsorParams): ServiceWorker<SponsorParams> {
  return new SponsorWorker();
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  return runService<SponsorParams>(req, getWorker);
});
