
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { BillsDAO } from "../../shared/BillsDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill, Committee, DBCommittee, LegislationInfo } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { calcSearchKey } from "../../shared/calcSearchKey.ts";
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";

configure();
const parser = new XMLParser();

async function fetchInCommitteeMap(biennium: string): Promise<Map<Committee, LegislationInfo[]>> {
  const map = new Map<Committee, LegislationInfo[]>();

  const committees: DBCommittee[] = await CommitteeDAO.getInstance().getAll();
  console.log(`Committees found`, committees.length);

  for (let i = 0; i < committees.length; i++) {
    const committee = committees[i].committee;
    const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx";
    const service = "GetInCommittee";
    const eBiennium = encodeURIComponent(biennium);
    const agency = encodeURIComponent(committee.Agency);
    const committeeName = encodeURIComponent(committee.Name!);
    const url = `${baseUrl}/${service}?biennium=${eBiennium}&agency=${agency}&committeeName=${committeeName}`
    const response = await fetch(url);
    const xmlText = await response.text();
    const json = parser.parse(xmlText);
    const infos = json["ArrayOfLegislationInfo"]["LegislationInfo"];
    map.set(committee, infos)
  }
  return map
}

function findInCommittee(map: Map<Committee, LegislationInfo[]>, bill: Bill): Committee | null {
  for (const [committee, infos] of map.entries()) {
    if (infos) {
      if (infos.find(info => info.BillId === bill.BillId)) {
        return committee;
      }
    }
  }
  return null
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting legistation committee service...");
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('bill_committee_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const billsDao = BillsDAO.getInstance();
    const entities = await billsDao.findLastUpdateBefore(sched.next_update, 'committee_update')
    if (entities.length === 0) {
      await resetSchedule(sched);
      console.info(`Found nothing to update.  Nect scheduled check`, sched.next_update);
      return standardResponse(origin, `Found nothing to update. Next check ${sched.next_update}`);
    }

    const params = await req.json();
    const map = await fetchInCommitteeMap(params.biennium);
    const now = new Date();
    for (let i = 0; i < entities.length; i++) {
      const dbBill = entities[i];
      const committee = findInCommittee(map, dbBill.bill);

      const updatedBill = {
        ...dbBill.bill,
        InCommittee: committee,
      }
      const searchKey = calcSearchKey(updatedBill);
      const updatedDBBill = {
        ...dbBill,
        bill: updatedBill,
        updated_at: now,
        committee_update: now,
        SearchKey: searchKey,
        CommitteeName: committee ? committee.Name : null
      }
      await billsDao.upsert(updatedDBBill);
    }
    console.info(`Updated ${entities.length} bills with committee information.`);
    return standardResponse(origin, `Done`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
