
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { calcSearchKey } from "../../shared/calcSearchKey.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill, BillHearing } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";

configure();
const parser = new XMLParser();

async function fetchHearings(bill: Bill): Promise<BillHearing[]> {
  const baseUrl = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";
  const service = "GetHearings";
  const biennium = encodeURIComponent(bill.Biennium);
  const billNumber = encodeURIComponent(bill.BillNumber);
  const url = `${baseUrl}/${service}?biennium=${biennium}&billNumber=${billNumber}`
  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  const hearings = json["ArrayOfHearing"]["Hearing"];
  return hearings ?? []
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.info("Starting legislation hearings service...");
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('bill_hearings_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const billsDao = BillsDAO.getInstance();
    const entities = await billsDao.findLastUpdateBefore(sched.next_update, 'hearings_update')
    if (entities.length === 0) {
      await resetSchedule(sched);
      console.info(`Found nothing to update.  Next scheduled check`, sched.next_update);
      return standardResponse(origin, `Found nothing to update. Next check ${sched.next_update}`);
    }

    const now = new Date();
    for (let i = 0; i < entities.length; i++) {
      const dbBill = entities[i];
      const hearings = await fetchHearings(dbBill.bill);
      const updatedBill = {
        ...dbBill.bill,
        Hearings: hearings,
      }

      const searchKey = calcSearchKey(updatedBill);
      const updatedDBBill = {
        ...dbBill,
        bill: updatedBill,
        updated_at: now,
        hearings_update: now,
        SearchKey: searchKey,
      }
      await billsDao.upsert(updatedDBBill);
      console.info(`Updated bill ${dbBill.bill.BillId}.`);
    }
    console.info(`Updated ${entities.length} bills with hearings information.`);
    return standardResponse(origin, `Done`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
