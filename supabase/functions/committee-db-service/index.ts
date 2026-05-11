
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";

configure();

const dao = new CommitteeDAO();
const updateScheduleDAO = UpdateScheduleDAO.getInstance();

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
    return standardResponse(origin, JSON.stringify(entities));
  } catch (err) {
    return errorResponse(origin, err);
  }
});
