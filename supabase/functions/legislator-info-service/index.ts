
import { FirebaseAiService, Project, ProjectContext } from "../../shared/FirebaseAiService.ts";
import { SponsorDAO } from "../../shared/SponsorDAO.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { resetSchedule } from "../../shared/resetSchedule.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Member } from "../../shared/types.ts";

configure();

const gemini_model = 'gemini-3.1-flash-lite-preview';

async function fetchPage(member: Member): Promise<string> {
  const url = `https://leg.wa.gov/legislators/member/${member.FirstName}-${member.LastName}`;
  let resp = await fetch(url);
  return resp.text();
}

async function scrapeInfo(html: string): Promise<any> {
  const prompt = "Parse the provided page and find the Address and Legislative assistant. Return the results in structure JSON";

  const context: ProjectContext = {
    value: html
  }

  const project: Project = {
    prompt: prompt,
    contexts: [context],
  }

  const infoShema = {
    type: "object",
    properties: {
      Address: {
        type: "string"
      },
      LegislativeAssistant: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            phone: {
              type: "string"
            }
          }
        }
      }
    }
  }

  try {
    return FirebaseAiService.getInstance()
      .parameterizedQuery(project, infoShema, gemini_model)
      .then(async result => JSON.parse(await result.response.text()))
  } catch (err) {
    console.error('Error during AI query', err);
    throw err;
  }

}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  try {
    console.log("Starting legislator info service...");

    const sponsorDAO = new SponsorDAO();
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched = await updateScheduleDAO.getByName('legislator_info');

    if (sched.next_update.getTime() > new Date().getTime()) {
      console.info(`Not time to be updated`, sched.next_update);
      return standardResponse(origin, `Not time to be updated`);
    }

    const entities = await sponsorDAO.findLastUpdateBefore(sched.next_update, 'info_update');

    if (entities.length === 0) {
      await resetSchedule(sched);
      console.info(`Found nothing to update.  Next scheduled check`, sched.next_update);
      return standardResponse(origin, `Found nothing to update. Next check ${sched.next_update}`);
    }

    const allUpdated: Member[] = [];
    for (let i = 0; i < entities.length; i++) {
      const sponsor = entities[i].sponsor;

      // Load HTML for the legislator
      const pageText = await fetchPage(sponsor);

      // Send page to AI to extract address and assistant information
      const info = await scrapeInfo(pageText);
      console.log(`Scraped page for ${sponsor.Name}`, info);

      // Update legislator in DB with new information
      const updated: Member = {
        ...sponsor,
        ...info
      };
      const upserted = await sponsorDAO.updateInfo(updated);
      allUpdated.push(upserted);
    }
    console.log(`Saved ${allUpdated.length} records to the database.`);
    return standardResponse(origin, `Updated ${allUpdated.length} records.`);

  } catch (err) {
    return errorResponse(origin, err);
  }
});
