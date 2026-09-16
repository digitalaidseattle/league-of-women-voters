import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

export type DBPreference = {
    id: Identifier,
    biennium: string,
    bills: string[],
    created_at: Date
}

export class PreferencesDB extends SupabaseDAO<DBPreference> {

    private static instance: PreferencesDB;

    public static getInstance(): PreferencesDB {
        if (!PreferencesDB.instance) {
            PreferencesDB.instance = new PreferencesDB();
        }
        return PreferencesDB.instance;
    }

    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Preferences');
    }

    async getCurrentPreference(): Promise<DBPreference> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            throw new Error(`Failed to load Preferences: ${error.message}`);
        }
        return data as DBPreference;
    }

    getCurrentBiennium(): Promise<string> {
        return this.getCurrentPreference().then(pref => pref.biennium);
    }
}