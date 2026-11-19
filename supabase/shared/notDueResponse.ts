/**
*  notDueResponse.ts
*
*  @copyright 2026 Digital Aid Seattle
*
*/

import { standardResponse } from "./standardResponse.ts";
import { UpdateSchedule } from "./UpdateScheduleDAO.ts";

export const NOT_DUE_MESSAGE = "Not due for an update yet.";

// Logs and returns the reply for a job whose schedule says it is not due yet
export function notDueResponse(origin: string, sched: UpdateSchedule): Response {
    console.info(NOT_DUE_MESSAGE, sched.next_update);
    return standardResponse(origin, NOT_DUE_MESSAGE);
}
