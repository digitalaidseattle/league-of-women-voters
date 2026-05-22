import { Identifier } from "npm:@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { Committee, DBCommittee } from "./types.ts";

export class CommitteeDAO extends SupabaseDAO<DBCommittee> {
  private static instance: CommitteeDAO;

  public static getInstance(): CommitteeDAO {
    if (!CommitteeDAO.instance) {
      CommitteeDAO.instance = new CommitteeDAO();
    }
    return CommitteeDAO.instance;
  }

  constructor() {
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Committees');
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

  async findById(entityId: Identifier): Promise<DBCommittee | null> {
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