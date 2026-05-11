import { Entity } from "npm:@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";

export type UpdateSchedule = Entity & {
    created_at: Date,
    name: string,
    last_update: Date
}

export class UpdateScheduleDAO extends SupabaseDAO<UpdateSchedule> {

    private static instance: UpdateScheduleDAO;

    public static getInstance(): UpdateScheduleDAO {
        if (!UpdateScheduleDAO.instance) {
            UpdateScheduleDAO.instance = new UpdateScheduleDAO();
        }
        return UpdateScheduleDAO.instance;
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