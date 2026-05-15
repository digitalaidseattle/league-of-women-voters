
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill } from "../../shared/types.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";
const parser = new XMLParser();

async function fetchDetail(bill: Bill): Promise<Bill> {
  const bilUrl = `${BASE_URL}/GetLegislation?biennium=${bill.Biennium}&billNumber=${bill.BillNumber}`;
  const response = await fetch(bilUrl);
  const xml = await response.text();
  const json = parser.parse(xml);
  const legislation = json["ArrayOfLegislation"]["Legislation"];
  return (Array.isArray(legislation) ? legislation : [legislation]).find((l: any) => l.BillId === bill.BillId) as Bill;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting legistation detail service...");
    const updateScheduleDAO = new UpdateScheduleDAO();
    const billsDao = BillsDAO.getInstance();

    const sched = await updateScheduleDAO
      .getByName('bill_detail_update');

    const entities = await billsDao.findLastUpdateBefore(sched.last_update, 'detail_update')
    if (entities.length === 0) {
      console.log(`Updating to next time`);
      const nextCheck = new Date();
      nextCheck.setDate(nextCheck.getDate() + (sched.time_span ?? 1));
      await updateScheduleDAO
        .upsert({
          ...sched,
          last_update: nextCheck,
        })
    } else {
      console.log(`Found ${entities.length} bill before ${sched.last_update}`);
      while (entities.length > 0) {
        // for (let i = 0; i < 1; i++) {
        for (let i = 0; i < entities.length; i++) {
          const dbBill = entities[i];
          const detail = await fetchDetail(dbBill.bill);
          const updated = {
            ...dbBill,
            bill: {
              ...dbBill.bill,
              ...detail,
            },
            PrimeSponsorID: detail.PrimeSponsorID,
            detail_update: new Date()
          }
          await billsDao.upsert(updated);
        }
        console.log(`Updated ${entities.length} bills with detail information.`);
      }
    }


    return standardResponse(origin, `Done`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
