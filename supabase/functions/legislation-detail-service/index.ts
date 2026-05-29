
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { calcSearchKey } from "../../shared/calcSearchKey.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";
const parser = new XMLParser();

async function fetchDetail(bill: Bill): Promise<Bill> {
  const billUrl = `${BASE_URL}/GetLegislation?biennium=${bill.Biennium}&billNumber=${bill.BillNumber}`;
  const response = await fetch(billUrl);
  const xml = await response.text();
  const json = parser.parse(xml);
  console.info(billUrl, json);
  const legislation = json["ArrayOfLegislation"]["Legislation"];
  console.info(legislation);
  return (Array.isArray(legislation) ? legislation : [legislation]).find((l: any) => l.BillId === bill.BillId) as Bill;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.info("Starting legistation detail service...");
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('bill_detail_update');
    console.info('Found schedule:', sched);

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const billsDao = BillsDAO.getInstance();
    const entities = await billsDao.findLastUpdateBefore(sched.next_update, 'detail_update')
    if (entities.length === 0) {
      await resetSchedule(sched);
      console.info(`Found nothing to update.  Next scheduled check`, sched.next_update);
      return standardResponse(origin, `Found nothing to update. Next check ${sched.next_update}`);
    }

    const now = new Date();
    for (let i = 0; i < entities.length; i++) {
      const dbBill = entities[i];
      const detail = await fetchDetail(dbBill.bill);
      const updatedBill = {
        ...dbBill.bill,
        ...detail,
      }
      const searchKey = calcSearchKey(updatedBill);
      const updatedDBBill = {
        ...dbBill,
        bill: updatedBill,
        updated_at: now,
        detail_update: now,
        PrimeSponsorID: detail.PrimeSponsorID,
        SearchKey: searchKey
      }
      await billsDao.upsert(updatedDBBill);
    }
    console.info(`Updated ${entities.length} bills with detail information.`);
    return standardResponse(origin, `Done`);
  } catch (err) {
    console.error(`Failed to update bill details`, err);
    return errorResponse(origin, err);
  }
});
