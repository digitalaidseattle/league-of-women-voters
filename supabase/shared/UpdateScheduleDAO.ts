import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { Entity } from "npm:@digitalaidseattle/core";

export type UpdateSchedule = Entity & {
    created_at: Date,
    name: string,
    next_update: Date,
    wait_time: number
}

export class UpdateScheduleDAO extends SupabaseDAO<UpdateSchedule> {

    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Update_schedules');
    }

    // must be one row, or will throw an error
    async getByName(name: string): Promise<UpdateSchedule> {
        try {
            const { data, error } = await this.client.from(this.tableName)
                .select("*")
                .eq('name', name)
                .single();
            if (error) {
                console.error('Unexpected error during select', error);
                throw new Error('Unexpected error during select');
            }
            console.info(data, data.next_update, new Date(data.next_update))
            return ({
                ...data,
                next_update: new Date(data.next_update)
            }) as UpdateSchedule;
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

}