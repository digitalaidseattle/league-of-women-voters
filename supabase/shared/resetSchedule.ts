/**
*  resetSchedule.ts
*
*  @copyright 2025 Digital Aid Seattle
*
*/

import { UpdateSchedule, UpdateScheduleDAO } from "./UpdateScheduleDAO.ts";

export async function resetSchedule(sched: UpdateSchedule): Promise<void> {
    const updateScheduleDAO = new UpdateScheduleDAO();

    const nextCheck = new Date();
    nextCheck.setHours(nextCheck.getDate() + (sched.wait_time ?? 1));
    await updateScheduleDAO
        .upsert({
            ...sched,
            next_update: nextCheck,
        })

};