
import { CommitteeDAO } from "../../shared/CommitteeDAO.ts";
import { UpdateScheduleDAO } from "../../shared/UpdateScheduleDAO.ts";
import { configure } from "../../shared/configuration.ts";
import { corsResponse } from "../../shared/corsResponse.ts";
import { errorResponse } from "../../shared/errorResponse.ts";
import { standardResponse } from "../../shared/standardResponse.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

configure();


Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // Handle preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return corsResponse(origin);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  const dao = new CommitteeDAO(supabase);
  const updateScheduleDAO = new UpdateScheduleDAO(supabase);


  try {
    console.log("Starting committee db service...");
    const sched = await updateScheduleDAO
      .getByName('committee-leadership');
    console.log(sched);
    // Lookup the existing legistators in DB.
    const entities = await dao
      .findLastUpdateBefore(sched.last_update, 'leadership_update');
    console.log(entities)
    return standardResponse(origin, JSON.stringify(entities));
  } catch (err) {
    return errorResponse(origin, err);
  }
});
