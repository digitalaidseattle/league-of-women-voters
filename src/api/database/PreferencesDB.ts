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

    // The Supabase client grabs a Web Lock for auth on each request. Under
    // concurrent access (e.g. React StrictMode firing an effect twice, or a
    // background token refresh) one call can have its lock "stolen", aborting
    // the request. Retry once after a short delay when that happens.
    private async withLockRetry<R>(fn: () => Promise<R>): Promise<R> {
        try {
            return await fn();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("Lock") || message.includes("AbortError")) {
                await new Promise((resolve) => setTimeout(resolve, 150));
                return await fn();
            }
            throw error;
        }
    }

    async getCurrentPreference(): Promise<DBPreference> {
        return this.withLockRetry(async () => {
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
        });
    }

    getCurrentBiennium(): Promise<string> {
        return this.getCurrentPreference().then(pref => pref.biennium);
    }

    async updateBiennium(id: Identifier, biennium: string): Promise<DBPreference> {
        return this.withLockRetry(() => this.update(id, { biennium }));
    }
}