import { SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Committee, DBCommittee } from "./types.ts";

export class CommitteeDAO extends SupabaseDAO<DBCommittee> {

  constructor() {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    super(supabase, 'Committees')
  }

  async findLastUpdateBefore(date: Date, field?: string): Promise<DBCommittee[]> {
    const check = field ?? 'updated_at';
    const dateString = date.toISOString();
    return this.client
      .from(this.tableName)
      .select('*')
      .or(`${check}.lt.${dateString},${check}.is.null`)
      .then((resp: any) => resp.data as DBCommittee[])
  }

  async updateLeadership(entity: Committee): Promise<Committee> {
    const now = new Date();
    const current = await this.getById(entity.Id);
    const up = (
      {
        ...current,
        committee: entity,
        leadership_update: now
      })
    return this.upsert(up)
      .then((committeeDB: DBCommittee) => committeeDB.committee)
  }

  async updateMembership(entity: Committee): Promise<Committee> {
    const now = new Date();
    const current = await this.getById(entity.Id);
    const up = (
      {
        ...current,
        committee: entity,
        membership_update: now
      })
    return this.upsert(up)
      .then((committeeDB: DBCommittee) => committeeDB.committee)
  }
}