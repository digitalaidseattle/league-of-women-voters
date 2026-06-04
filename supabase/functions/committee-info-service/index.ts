
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Committee, DBCommittee } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/CommitteeService.asmx";
const parser = new XMLParser();

async function fetchData(): Promise<Committee[]> {
  const service = "GetActiveCommittees";
  const url = `${BASE_URL}/${service}`

  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  return json["ArrayOfCommittee"]["Committee"];
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting committee info caching service...");

    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('committee_info_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const infos = await fetchData();

    const committeeDAO = CommitteeDAO.getInstance();
    const now = new Date();
    const allUpdated: DBCommittee[] = [];
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const current = await committeeDAO.findById(info.Id);
      const updatedCommittee: Committee = current
        ? {
          ...current.committee,
          ...info,
          Agency: info.Agency || current.committee.Agency,
        }
        : {
          ...info,
          Agency: info.Agency
        }
      //const searchKey = calcCommitteeSearchKey(updatedCommittee as Bill);
      const updatedDBCommittee = {
        ...current,
        id: current ? current.id : updatedCommittee.Id,
        committee: updatedCommittee,
        updated_at: now
      }
      allUpdated.push(await committeeDAO.upsert(updatedDBCommittee));
    };
    await resetSchedule(sched);
    console.info(`Saved ${allUpdated.length} committees to the database.`);
    return standardResponse(origin, `Updated ${allUpdated.length} committees.`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
