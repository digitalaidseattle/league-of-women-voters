
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { FirebaseAiService, Project, ProjectContext } from "../../shared/FirebaseAiService.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Committee } from "../../shared/types.ts";

configure();

const dao = new CommitteeDAO();
const updateScheduleDAO = UpdateScheduleDAO.getInstance();
const gemini_model = 'gemini-3.1-flash-lite-preview';

async function fetchPage(committee: Committee): Promise<string> {
  const url = committee.Agency === 'House'
    ? `https://leg.wa.gov/about-the-legislature/committees/house-of-representatives/${committee.Acronym}`
    : committee.Agency === 'Senate'
      ? `https://leg.wa.gov/about-the-legislature/committees/senate/${committee.Acronym}`
      : `https://leg.wa.gov/about-the-legislature/committees/joint/${committee.Acronym}`
  let resp = await fetch(url);
  return resp.text();
}

async function scrapeInfo(html: string): Promise<any> {
  const prompt = "Parse the provided page and list the committee leaders in structured JSON";

  const context: ProjectContext = {
    value: html
  }

  const project: Project = {
    prompt: prompt,
    contexts: [context],
  }

  const leadershipSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        role: {
          type: "string"
        },
        name: {
          type: "string"
        }
      },
      required: ["role", "name"]
    }
  }

  try {
    return FirebaseAiService.getInstance()
      .parameterizedQuery(project, leadershipSchema, gemini_model)
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
    console.log("Starting committee leadership service...");
    const sched = await updateScheduleDAO
      .getByName('committee-leadership');

    // Lookup the existing legistators in DB.
    const entities = await dao
      .findLastUpdateBefore(sched.last_update, 'leadership_update');

    // FIXME for (let i = 0; i < sponsors.length; i++) {
    for (let i = 0; i <= 0; i++) {
      const committee = entities[i].committee;

      // Load HTML for the legislator
      const pageText = await fetchPage(committee);

      // Send page to AI to extract address and assistant information
      const info = await scrapeInfo(pageText);
      console.log(`Scraped page for ${committee.Name}`, info);

      // Update legislator in DB with new information
      const updated: Committee = {
        ...committee,
        Leadership: info
      };
      const upserted = await dao.updateLeadership(updated);
    }
    const nextCheck = new Date();
    nextCheck.setDate(nextCheck.getDate() + sched.time_span);
    await updateScheduleDAO
      .upsert({
        ...sched,
        last_update: nextCheck,
      })
    return standardResponse(origin, "Done");
  } catch (err) {
    return errorResponse(origin, err);
  }
});
