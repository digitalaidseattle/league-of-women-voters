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
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";

type CommitteeInputParams = {
  operation: string;
  biennium?: string;
  agency?: string;
  committeeName?: string;
};

class GetActiveCommitteesWorker implements ServiceWorker<CommitteeInputParams> {

  validate(_params: CommitteeInputParams) {
    // nothing to check
  }

  getLegUrl(_params: CommitteeInputParams): string {
    const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
    const service = "GetActiveCommittees";

    return `${baseUrl}/${service}`;
  }

  getEntities(json: any): any {
    return json["ArrayOfCommittee"]["Committee"];
  }

}

class GetActiveCommitteeMembersWorker implements ServiceWorker<CommitteeInputParams> {

  validate(params: CommitteeInputParams) {
    if (
      (!params.agency || !params.committeeName)
    ) {
      throw new Error(`agency and committeeName are required for operation ${params.operation}`, { cause: "BadRequest" });
    }
  }

  getLegUrl(params: CommitteeInputParams): string {
    const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
    const service = "GetActiveCommitteeMembers";
    const biennium = encodeURIComponent(params.biennium!);
    const agency = encodeURIComponent(params.agency!);
    const committeeName = encodeURIComponent(params.committeeName!);
    return `${baseUrl}/${service}?biennium=${biennium}&agency=${agency}&committeeName=${committeeName}`
  }

  getEntities(json: any): any {
    return json["ArrayOfMember"]["Member"];
  }

}

class GetCommitteeReferralsByCommitteeWorker implements ServiceWorker<CommitteeInputParams> {

  validate(params: CommitteeInputParams) {
    if (
      (!params.agency || !params.committeeName)
    ) {
      throw new Error(`agency and committeeName are required for operation ${params.operation}`, { cause: "BadRequest" });
    }
  }

  getLegUrl(params: CommitteeInputParams): string {
    const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
    const service = "GetCommitteeReferralsByCommittee";
    const biennium = encodeURIComponent(params.biennium!);
    const agency = encodeURIComponent(params.agency!);
    const committeeName = encodeURIComponent(params.committeeName!);
    return `${baseUrl}/${service}?biennium=${biennium}&agency=${agency}&committeeName=${committeeName}`
  }

  getEntities(json: any): any {
    return json["ArrayOfCommitteeReferral"]["CommitteeReferral"];
  }

}

class GetInCommitteeWorker implements ServiceWorker<CommitteeInputParams> {

  validate(params: CommitteeInputParams) {
    if (
      (!params.agency || !params.committeeName)
    ) {
      throw new Error(`agency and committeeName are required for operation ${params.operation}`, { cause: "BadRequest" });
    }
  }

  getLegUrl(params: CommitteeInputParams): string {
    const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
    const service = "GetInCommittee";
    const biennium = encodeURIComponent(params.biennium!);
    const agency = encodeURIComponent(params.agency!);
    const committeeName = encodeURIComponent(params.committeeName!);
    return `${baseUrl}/${service}?biennium=${biennium}&agency=${agency}&committeeName=${committeeName}`
  }

  getEntities(json: any): any {
    return json["ArrayOfLegislationInfo"]["LegislationInfo"];
  }

}

function getWorker(params: CommitteeInputParams) {
  switch (params.operation) {
    case "GetActiveCommittees":
      return new GetActiveCommitteesWorker();
    case "GetActiveCommitteeMembers":
      return new GetActiveCommitteeMembersWorker();
    case "GetCommitteeReferralsByCommittee":
      return new GetCommitteeReferralsByCommitteeWorker();
    case "GetInCommittee":
      return new GetInCommitteeWorker();
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
