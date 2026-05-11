import { SupabaseClient } from 'npm:@supabase/supabase-js';
import { Committee, DBCommittee } from "./types.ts";
import { Identifier } from 'npm:@digitalaidseattle/core';

export class CommitteeDAO {

  client: SupabaseClient;
  tableName = 'Committees';

  constructor(client: SupabaseClient) {
    this.client = client;
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

  async upsert(entity: DBCommittee): Promise<DBCommittee> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .upsert([entity])
        .select('*')
        .single();
      if (error) {
        console.error('Failed to upsert entity', error);
        throw new Error('Failed to upsert entity');
      }
      return data as DBCommittee;
    } catch (err) {
      console.error('Error inserting entity:', err);
      throw err;
    }
  }

  async getById(entityId: Identifier): Promise<DBCommittee> {
    try {

      const { data, error } = await this.client.from(this.tableName)
        .select("*")
        .eq('id', entityId)
        .single();
      if (error) {
        console.error('Unexpected error during select', error);
        throw new Error('Unexpected error during select');
      }
      return data as DBCommittee;
    } catch (err) {
      console.error('Unexpected error during select:', err);
      throw err;
    }
  }
}