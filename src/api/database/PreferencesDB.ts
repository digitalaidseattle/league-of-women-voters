import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

export type DBPreference = {
    id: Identifier,
    biennium: string,
    bills: unknown,
    created_at: Date
}

class InternalPreferencesDAO extends SupabaseDAO<DBPreference> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Preferences');
    }

    async getCurrent(): Promise<DBPreference> {
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
}

export class PreferencesDB {

    private static instance: PreferencesDB;

    public static getInstance(): PreferencesDB {
        if (!PreferencesDB.instance) {
            PreferencesDB.instance = new PreferencesDB();
        }
        return PreferencesDB.instance;
    }

    db_dao: InternalPreferencesDAO;

    constructor() {
        this.db_dao = new InternalPreferencesDAO();
    }

    getCurrentPreference(): Promise<DBPreference> {
        return this.db_dao.getCurrent();
    }

    getCurrentBiennium(): Promise<string> {
        return this.db_dao.getCurrent().then(pref => pref.biennium);
    }
}