import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";

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
  const parser = new XMLParser();

  try {
    const response = await fetch(
      "https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetActiveCommittees",
      {
        method: "GET",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          "SOAPAction":
            "https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetActiveCommittees",
        },
      },
    );

    const xmlText = await response.text();

    // Parse XML to JSON
    const json = parser.parse(xmlText);
    const committees = json["ArrayOfCommittee"]["Committee"];

    return new Response(JSON.stringify(committees), {
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
