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


type CommitteeInputParams = {
  operation: string;
  biennium?: string;
  agency?: string;
  committeeName?: string;
};

function validateParams(params: CommitteeInputParams) {
  const validOperations = [
    "GetActiveCommitteeMembers",
    "GetActiveCommittees",
    "GetCommitteeReferralsByCommittee",
  ];
  if (!params.operation || !validOperations.includes(params.operation)) {
    throw new Error(
      `Invalid operation. Must be one of: ${validOperations.join(", ")}`,
      { cause: "BadRequest" },
    );
  }
  if (
    (params.operation === "GetActiveCommitteeMembers" ||
      params.operation === "GetCommitteeReferralsByCommittee") &&
    (!params.agency || !params.committeeName)
  ) {
    throw new Error(
      `agency and committeeName are required for operation ${params.operation}`,
      { cause: "BadRequest" },
    );
  }
  if (
    params.operation === "GetCommitteeReferralsByCommittee" &&
    !params.biennium
  ) {
    throw new Error(
      `biennium is required for operation ${params.operation}`,
      { cause: "BadRequest" },
    );
  }
}

function getLegUrl(params: CommitteeInputParams) {
  const committeeURL =
    "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
  const committeeActionURL =
    "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
  switch (params.operation) {
    case "GetActiveCommitteeMembers":
      return `${committeeURL}/GetActiveCommitteeMembers?agency=${
        encodeURIComponent(params.agency!)
      }&committeeName=${encodeURIComponent(params.committeeName!)}`;
    case "GetActiveCommittees":
      return `${committeeURL}/GetActiveCommittees`;
    case "GetCommitteeReferralsByCommittee":
      return `${committeeActionURL}/GetCommitteeReferralsByCommittee?biennium=${
        encodeURIComponent(params.biennium!)
      }&agency=${encodeURIComponent(params.agency!)}&committeeName=${
        encodeURIComponent(params.committeeName!)
      }`;
    default:
      return committeeURL;
  }
}

function getEntities(operation: string, json: any) {
  switch (operation) {
    case "GetActiveCommitteeMembers":
      return json["ArrayOfMember"]["Member"];
    case "GetActiveCommittees":
      return json["ArrayOfCommittee"]["Committee"];
    case "GetCommitteeReferralsByCommittee":
      return json["ArrayOfCommitteeReferral"]["CommitteeReferral"];
    default:
      return [];
  }
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
    validateParams(params);
    const url = getLegUrl(params);
    const parser = new XMLParser();
    const response = await fetch(url);
    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    const entities = getEntities(params, json);

    return new Response(JSON.stringify(entities), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err) {
    const statusCode = err.cause === "BadRequest" ? 400 : 500;
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }
});
