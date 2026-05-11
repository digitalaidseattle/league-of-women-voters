import { Entity } from "npm:@digitalaidseattle/core";
import { SupabaseClient } from 'npm:@supabase/supabase-js';

export type UpdateSchedule = Entity & {
    created_at: Date,
    name: string,
    last_update: Date
}

export class UpdateScheduleDAO {

    client: SupabaseClient;
    tableName = 'Update_schedules';

    constructor(client: SupabaseClient) {
        this.client = client;
    }

    // must be one row, or will throw an error
    async getByName(name: string): Promise<UpdateSchedule> {
        try {
            console.log
            const { data, error } = await this.client.from(this.tableName)
                .select("*")
                .eq('name', name)
                .single();
            if (error) {
                console.error('Unexpected error during select', error);
                throw new Error('Unexpected error during select');
            }
            return ({
                ...data,
                last_update: new Date(data.last_update)
            }) as UpdateSchedule;
            } catch (err) {
                console.error('Unexpected error during select:', err);
                throw err;
            }
        }

}