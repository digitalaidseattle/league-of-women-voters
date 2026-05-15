
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { DBBill } from "../../shared/types.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";

async function fetchData(year: number): Promise<DBBill[]> {
  const parser = new XMLParser();

  const url = `${BASE_URL}/GetLegislationByYear?year=${year}`;
  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  const now = new Date();
  const summaries = json["ArrayOfLegislationInfo"]["LegislationInfo"];
  const bills: DBBill[] = [];
  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    // const bilUrl = `${BASE_URL}/GetLegislation?biennium=${summary.Biennium}&billNumber=${summary.BillNumber}`;
    // const detailResponse = await fetch(bilUrl);
    // const detailXml = await detailResponse.text();
    // const detailJson = parser.parse(detailXml);
    // const detail = detailJson["ArrayOfLegislation"]["Legislation"];
    bills.push({
      id: summary.BillId,
      bill: {
        ...summary,
        Id: summary.BillId,
      },
      updated_at: now
    } as DBBill);
  };

  return bills;
}

async function save(data: DBBill[]): Promise<DBBill[]> {
  const billsDao = BillsDAO.getInstance();
  const saved: DBBill[] = [];

  for (let i = 0; i < data.length; i++) {
    const bill = data[i];
    saved.push(await billsDao.upsert(bill));
    console.log(`Saved bill summary ${bill.id} to the database.`);
  }
  return saved;

}


Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting bill caching service...");

    const year = 2025;  // TODO get year from request
    const bills = await fetchData(year);
    const savedBills = await save(bills);
    console.log(`Saved ${savedBills.length} bills to the database.`);
    return standardResponse(origin, `Updated ${savedBills.length} bills.`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
