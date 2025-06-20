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


  const { biennium } = await req.json();
  try {
    const response = await fetch(
      `https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetSponsors?biennium=${encodeURIComponent(biennium)}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          "SOAPAction":
            "https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetSponsors",
        },
      },
    );

    const xmlText = await response.text();

    // Parse XML to JSON
    const parser = new XMLParser();
    const json = parser.parse(xmlText);

    const entities = json["ArrayOfMember"]["Member"];

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
