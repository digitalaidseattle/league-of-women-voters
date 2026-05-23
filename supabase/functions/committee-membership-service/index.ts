
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Bill, Committee } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";

configure();
const parser = new XMLParser();

async function fetchDetail(committee: Committee, biennium: string): Promise<any> {
  const baseUrl = "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
  const service = "GetActiveCommitteeMembers";
  const eBiennium = encodeURIComponent(biennium);
  const agency = encodeURIComponent(committee.Agency);
  const committeeName = encodeURIComponent(committee.Name!);
  const url = `${baseUrl}/${service}?biennium=${eBiennium}&agency=${agency}&committeeName=${committeeName}`
  const response = await fetch(url);
  const xml = await response.text();
  const json = parser.parse(xml);
  const members = json["ArrayOfMember"]["Member"];
  return members;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting committee membership service...");
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('committee_membership_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const dao = CommitteeDAO.getInstance();
    const entities = await dao.findLastUpdateBefore(sched.next_update, 'membership_update')
    if (entities.length === 0) {
      await resetSchedule(sched);
      console.info(`Found nothing to update.  Next scheduled check`, sched.next_update);
      return standardResponse(origin, `Found nothing to update. Next check ${sched.next_update}`);
    }

    const params = await req.json();
    console.log(params)
    const now = new Date();
    for (let i = 0; i < entities.length; i++) {
      const dbCommittee = entities[i];
      const detail = await fetchDetail(dbCommittee.committee, params.biennium);
      const updatedCommittee = {
        ...dbCommittee.committee,
        Members: detail,
      }
      // const searchKey = calcCommitteeSearchKey(updatedCommittee);
      const updatedDBCommittee = {
        ...dbCommittee,
        committee: updatedCommittee,
        updated_at: now,
        membership_update: now,
      }
      await dao.upsert(updatedDBCommittee);
    }
    console.info(`Updated ${entities.length} committees with membership information.`);
    return standardResponse(origin, `Done`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
