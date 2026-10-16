import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

export type DBPreference = {
    id: Identifier,
    user_id?: string | null,
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

    private async getMyUserId(): Promise<string> {
        const { data, error } = await this.client.auth.getUser();
        if (error || !data?.user) {
            throw new Error(`Not authenticated: ${error?.message ?? 'no user'}`);
        }
        return data.user.id;
    }

    // The global/default row (user_id is null) carries the current biennium.
    async getGlobalBiennium(): Promise<string> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('biennium')
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to load Preferences: ${error.message}`);
        }
        return data?.biennium ?? '';
    }

    // Returns the signed-in user's preference row, creating it on first access.
    async getOrCreateMyPreference(): Promise<DBPreference> {
        const userId = await this.getMyUserId();

        const { data: existing, error: selectError } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
        if (selectError) {
            throw new Error(`Failed to load Preferences: ${selectError.message}`);
        }
        if (existing) {
            return existing as DBPreference;
        }

        const biennium = await this.getGlobalBiennium();
        const { data: created, error: insertError } = await this.client
            .from(this.tableName)
            .insert({ user_id: userId, biennium, bills: [] })
            .select()
            .single();
        if (insertError) {
            throw new Error(`Failed to create Preferences: ${insertError.message}`);
        }
        return created as DBPreference;
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
