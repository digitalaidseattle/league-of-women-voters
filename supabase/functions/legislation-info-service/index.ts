
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill, DBBill, LegislationInfo } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { calcSearchKey } from "../../shared/calcSearchKey.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";

async function fetchData(year: number): Promise<LegislationInfo[]> {
  const parser = new XMLParser();

  const url = `${BASE_URL}/GetLegislationByYear?year=${year}`;
  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  return json["ArrayOfLegislationInfo"]["LegislationInfo"];
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

function isNewOrStale(dbBill: DBBill | null, sched: UpdateSchedule): boolean {
  if (!dbBill) {
    return true;
  }
  // Handle old data
  if (!dbBill.info_update) {
    return true;
  }
  return dbBill.info_update.getTime() < sched.next_update.getTime()
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting bill caching service...");

    const updateScheduleDAO = new UpdateScheduleDAO();
    const billsDao = BillsDAO.getInstance();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('bill_info_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }
    const params = await req.json();
    const year = params.year;
    const infos = await fetchData(year);
    console.info(`Found ${infos.length} bills to update for year : ${year}.`);

    const now = new Date();
    const allUpdated: DBBill[] = [];
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      console.info(`Saving ${info.BillId}.`);
      const current = await billsDao.findById(info.BillId);

      if (isNewOrStale(current, sched)) {
        // console.info(`Updating ${current?.id}.`);
        const updatedBill = current
          ? {
            ...current.bill,
            ...info
          }
          : {
            ...info,
          }
        const searchKey = calcSearchKey(updatedBill as Bill);
        const updatedDBBill = {
          ...current,
          id: current ? current.id : updatedBill.BillId,
          bill: updatedBill,
          updated_at: now,
          info_update: now,
          OriginalAgency: info.OriginalAgency,
          SearchKey: searchKey
        }
        const upserted = await billsDao.upsert(updatedDBBill);
        console.info(`Saved ${upserted.id}.`);
        allUpdated.push(upserted);
      }
    };
    await resetSchedule(sched);
    console.info(`Saved ${allUpdated.length} bills to the database.`);
    return standardResponse(origin, `Updated ${allUpdated.length} bills.`);
  } catch (err) {
    console.error(`Could not update`, err);
    return errorResponse(origin, err);
  }
});
