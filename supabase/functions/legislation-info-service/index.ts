
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { DBBill, LegislationInfo } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/LegislationService.asmx";

async function fetchData(year: number): Promise<LegislationInfo[]> {
  const parser = new XMLParser();

  const url = `${BASE_URL}/GetLegislationByYear?year=${year}`;
  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  const now = new Date();
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
    const year = 2025;  // TODO get year from request
    const infos = await fetchData(year);

    const now = new Date();
    const allUpdated: DBBill[] = [];

    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const current = await billsDao.findById(info.BillId);
      !current && console.log(info.BillId)

      const updated = current
        ? {
          ...current,
          bill: {
            ...current.bill,
            ...info
          },
          updated_at: now,
          info_update: now,
          OriginalAgency: info.OriginalAgency
        }
        : {
          id: info.BillId,
          bill: {
            ...info
          },
          created_at: now,
          updated_at: now,
          info_update: now,
          OriginalAgency: info.OriginalAgency
        }
      allUpdated.push(await billsDao.upsert(updated));
    };

    await resetSchedule(sched);

    console.log(`Saved ${allUpdated.length} bills to the database.`);
    return standardResponse(origin, `Updated ${allUpdated.length} bills.`);

  } catch (err) {
    return errorResponse(origin, err);
  }
});
