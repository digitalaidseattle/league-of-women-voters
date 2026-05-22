import { Identifier } from "npm:@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { DBSponsor, Member } from "./types.ts";


export class SponsorDAO extends SupabaseDAO<DBSponsor> {
  private static instance: SponsorDAO;

  public static getInstance(): SponsorDAO {
    if (!SponsorDAO.instance) {
      SponsorDAO.instance = new SponsorDAO();
    }
    return SponsorDAO.instance;
  }

  constructor() {
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Sponsors')
  }

  async findLastUpdateBefore(date: Date, field?: string): Promise<DBSponsor[]> {
    console.log("Finding sponsors with last update before", date, "and field", field);
    const check = field ?? 'updated_at';
    const dateString = date.toISOString();
    return this.client
      .from(this.tableName)
      .select('*')
      .or(`${check}.lt.${dateString},${check}.is.null`)
      .then((resp: any) => resp.data as DBSponsor[])
  }

  async updateInfo(entity: Member): Promise<Member> {
    const now = new Date();
    const upload = {
      id: entity.Id,
      sponsor: entity,
      info_update: now,
    } as DBSponsor;
    return this.upsert(upload)
      .then((sponsor: DBSponsor) => sponsor.sponsor)
  }

  async findById(entityId: Identifier): Promise<DBSponsor | null> {
    try {

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', entityId)
        .maybeSingle();
      if (error) {
        console.error('Unexpected error during select', error);
        throw new Error('Unexpected error during select');
      }
      return data;
    } catch (err) {
      console.error('Unexpected error during select:', err);
      throw err;
    }
  }
}