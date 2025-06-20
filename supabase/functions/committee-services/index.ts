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

function getLegUrl(
  operation: string,
  biennium: string,
  agency: string,
  committeeName: string,
) {
  const committeeURL =
    "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
  const committeeActionURL =
    "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
  switch (operation) {
    case "GetActiveCommitteeMembers":
      return `${committeeURL}/GetActiveCommitteeMembers?agency=${
        encodeURIComponent(agency)
      }&committeeName=${encodeURIComponent(committeeName)}`;
    case "GetActiveCommittees":
      return `${committeeURL}/GetActiveCommittees`;
    case "GetCommitteeReferralsByCommittee":
      return `${committeeActionURL}/GetCommitteeReferralsByCommittee?biennium=${
        encodeURIComponent(biennium)
      }&agency=${encodeURIComponent(agency)}&committeeName=${
        encodeURIComponent(committeeName)
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

  const { operation, biennium, agency, committeeName } = await req.json();

  const url = getLegUrl(
    operation,
    biennium,
    agency,
    committeeName,
  );

  try {
    const parser = new XMLParser();
    const response = await fetch(url);
    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    const entities = getEntities(operation, json);

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
