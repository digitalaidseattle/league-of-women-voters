import { Entity } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";


export type UpdateSchedule = Entity & {
    created_at: Date,
    name: string,
    last_update: Date
}

export class UpdateScheduleDB extends SupabaseDAO<UpdateSchedule> {

    private static instance: UpdateScheduleDB;

    public static getInstance(): UpdateScheduleDB {
        if (!UpdateScheduleDB.instance) {
            UpdateScheduleDB.instance = new UpdateScheduleDB();
        }
        return UpdateScheduleDB.instance;
    }

    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(),
            'Update_schedules',
            {
                mapper: (json: any) => ({
                    ...json,
                    last_update: new Date(json.last_update)
                })
            })
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
            return this.mapJson(data);
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

}