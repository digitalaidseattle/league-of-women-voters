
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { SponsorDAO } from "../../shared/SponsorDAO.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { DBSponsor, Member } from "../../shared/types.ts";
import { UpdateSchedule, UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";

configure();
const BASE_URL = "https://wslwebservices.leg.wa.gov/SponsorService.asmx";
const parser = new XMLParser();
const dao = SponsorDAO.getInstance();

async function fetchData(biennium: string): Promise<Member[]> {
  const service = "GetSponsors";
  const eBiennium = encodeURIComponent(biennium)
  const url = `${BASE_URL}/${service}?biennium=${encodeURIComponent(eBiennium)}`

  const response = await fetch(url);
  const xmlText = await response.text();
  const json = parser.parse(xmlText);
  return json["ArrayOfMember"]["Member"];
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting legislator info caching service...");

    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched: UpdateSchedule = await updateScheduleDAO
      .getByName('legislator_update');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const params = await req.json();
    const infos = await fetchData(params.biennium);

    const now = new Date();
    const allUpdated: DBSponsor[] = [];
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const current = await dao.findById(info.Id);
      const updatedMember: Member = current
        ? {
          ...current.committee,
          ...info
        }
        : {
          ...info,
        }
      //const searchKey = calcCommitteeSearchKey(updatedCommittee as Bill);
      const updatedDBCommittee = {
        ...current,
        id: current ? current.id : updatedMember.Id,
        sponsor: updatedMember,
        OriginalAgency: updatedMember.Agency,
        updated_at: now
      }
      allUpdated.push(await dao.upsert(updatedDBCommittee));
    };
    await resetSchedule(sched);
    console.info(`Saved ${allUpdated.length} legislators to the database.`);
    return standardResponse(origin, `Updated ${allUpdated.length} legislators.`);
  } catch (err) {
    return errorResponse(origin, err);
  }
});
