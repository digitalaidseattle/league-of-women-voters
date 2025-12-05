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

// src/supabase/functions/committee-services/index.ts

import type { ServiceWorker } from "../types.ts";
import { handleCors } from "../../../utils/cors.ts";
import { runService } from "../../../utils/service_runner.ts";

type CommitteeInputParams = {
  operation: string;
  biennium?: string;
  agency?: string;
  committeeName?: string;
};

class GetActiveCommitteesWorker
  implements ServiceWorker<CommitteeInputParams>
{
  validate(_params: CommitteeInputParams) {
    // nothing to check
  }

  getLegUrl(_params: CommitteeInputParams): string {
    const committeeURL =
      "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
    return `${committeeURL}/GetActiveCommittees`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntities(json: any): any {
    return json["ArrayOfCommittee"]["Committee"];
  }
}

class GetActiveCommitteeMembersWorker
  implements ServiceWorker<CommitteeInputParams>
{
  validate(params: CommitteeInputParams) {
    if (!params.agency || !params.committeeName) {
      throw new Error(
        `agency and committeeName are required for operation ${params.operation}`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: CommitteeInputParams): string {
    const committeeURL =
      "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
    return `${committeeURL}/GetActiveCommitteeMembers?agency=${
      encodeURIComponent(params.agency!)
    }&committeeName=${encodeURIComponent(params.committeeName!)}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntities(json: any): any {
    return json["ArrayOfMember"]["Member"];
  }
}

class GetCommitteeReferralsByCommitteeWorker
  implements ServiceWorker<CommitteeInputParams>
{
  validate(params: CommitteeInputParams) {
    if (!params.agency || !params.committeeName || !params.biennium) {
      throw new Error(
        `agency, committeeName, and biennium are required for operation ${params.operation}`,
        { cause: "BadRequest" },
      );
    }
  }

  getLegUrl(params: CommitteeInputParams): string {
    const committeeActionURL =
      "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
    return `${committeeActionURL}/GetCommitteeReferralsByCommittee?biennium=${
      encodeURIComponent(params.biennium!)
    }&agency=${encodeURIComponent(params.agency!)}&committeeName=${
      encodeURIComponent(params.committeeName!)
    }`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntities(json: any): any {
    return json["ArrayOfCommitteeReferral"]["CommitteeReferral"];
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
    default:
      throw new Error(`Unknown operation: ${params.operation}`, {
        cause: "BadRequest",
      });
  }
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  return runService<CommitteeInputParams>(req, getWorker);
});
