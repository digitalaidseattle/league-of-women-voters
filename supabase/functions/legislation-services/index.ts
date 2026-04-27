/**
 *
<pre>
 POST /CommitteeService.asmx HTTP/1.1
Host: wslwebservices.leg.wa.gov
Content-Type: text/xml; charset=utf-8
Content-Length: length
SOAPAction: "http://WSLWebServices.leg.wa.gov/GetActiveCommitteeMembers"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetActiveCommitteeMembers xmlns="http://WSLWebServices.leg.wa.gov/">
      <agency>string</agency>
      <committeeName>string</committeeName>
    </GetActiveCommitteeMembers>
  </soap:Body>
</soap:Envelope>
</pre>

 */
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { ServiceWorker } from "../types.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";

type LegislationParams = {
  operation: string;
  biennium?: string;
  billNumber?: string;
};

const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";

class GetLegislationWorker implements ServiceWorker<LegislationParams> {

  validate(_params: LegislationParams) {
    // nothing to check
  }

  getLegUrl(params: LegislationParams): string {
    return `${BASE_URL}/GetLegislation?biennium=${params.biennium}&billNumber=${params.billNumber}`;
  }

  getEntities(json: any): any {
    return json["ArrayOfLegislation"]["Legislation"];
  }

}

class GetSponsorsWorker implements ServiceWorker<LegislationParams> {

  validate(_params: LegislationParams) {
    // nothing to check
  }

  getLegUrl(params: LegislationParams): string {
    return `${BASE_URL}/GetSponsors?biennium=${params.biennium}&billId=${params.billNumber}`;
  }

  getEntities(json: any): any {
    return json["ArrayOfSponsor"]["Sponsor"];
  }

}

function getWorker(params: LegislationParams) {
  switch (params.operation) {
    case "GetLegislation":
      return new GetLegislationWorker();
    case "GetSponsors":
      return new GetSponsorsWorker();
    default:
      throw Error(`Unknown operation: ${params.operation}`)
  }
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
