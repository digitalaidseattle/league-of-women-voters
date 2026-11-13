import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { DBPreference } from "./types.ts";


export class PreferencesDAO extends SupabaseDAO<DBPreference> {
  private static instance: PreferencesDAO;

  public static getInstance(): PreferencesDAO {
    if (!PreferencesDAO.instance) {
      PreferencesDAO.instance = new PreferencesDAO();
    }
    return PreferencesDAO.instance;
  }

  constructor() {
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Preferences')
  }

  async getCurrentBiennium(): Promise<string> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('biennium')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      console.error('Failed to load Preferences', error);
      throw new Error(`Failed to load Preferences: ${error.message}`);
    }
    return data.biennium as string;
  }
}
