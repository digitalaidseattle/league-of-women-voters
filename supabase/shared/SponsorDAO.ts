import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { DBSponsor, Member } from "./types.ts";


export class SponsorDAO extends SupabaseDAO<DBSponsor> {

  constructor() {
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Sponsors')
  }

  async findLastUpdateBefore(date: Date, field?: string): Promise<DBSponsor[]> {
    const check = field ?? 'updated_at';
    const dateString = date.toISOString();
    return this.client
      .from(this.tableName)
      .select('*')
      .or(`${check}.lt.${dateString},${check}.is.null`)
      .then(resp => resp.data as DBSponsor[])
  }

  async updateInfo(entity: Member): Promise<Member> {
    const now = new Date();
    const upload = {
      id: entity.Id,
      sponsor: entity,
      info_update: now,
    } as DBSponsor;
    return this.upsert(upload);
  }
}