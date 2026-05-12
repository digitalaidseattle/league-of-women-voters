
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { FirebaseAiService, Project, ProjectContext } from "../../shared/FirebaseAiService.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { Committee } from "../../shared/types.ts";

configure();


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
  const gemini_model = 'gemini-3.1-flash-lite-preview';

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

    const dao = new CommitteeDAO();
    const updateScheduleDAO = new UpdateScheduleDAO();

    const sched = await updateScheduleDAO
      .getByName('committee_leadership');

    // Lookup the existing legistators in DB.
    const entities = await dao
      .findLastUpdateBefore(sched.last_update, 'leadership_update');

    const allUpserted: Committee[] = [];

    for (let i = 0; i < entities.length; i++) {
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
      allUpserted.push(upserted);
    }

    const nextCheck = new Date();
    nextCheck.setDate(nextCheck.getDate() + (sched.time_span ?? 1));
    await updateScheduleDAO
      .upsert({
        ...sched,
        last_update: nextCheck,
      })
    return standardResponse(origin, JSON.stringify(allUpserted));
  } catch (err) {
    return errorResponse(origin, err);
  }
});
