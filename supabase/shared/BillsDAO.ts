import { Identifier } from "npm:@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { DBBill } from "./types.ts";

export class BillsDAO extends SupabaseDAO<DBBill> {

  private static instance: BillsDAO;

  public static getInstance(): BillsDAO {
    if (!BillsDAO.instance) {
      BillsDAO.instance = new BillsDAO();
    }
    return BillsDAO.instance;
  }

  constructor() {
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Bills', {
      mapper: (json: any) => ({
        ...json,
        info_update: new Date(json.info_update),
        detail_update: new Date(json.detail_update),
        committee_update: new Date(json.committee_update),
        sponsors_update: new Date(json.sponsors_update)
      })
    });
  }

  async findLastUpdateBefore(date: Date, field?: string): Promise<DBBill[]> {
    try {
      const check = field ?? 'updated_at';
      const dateString = date.toISOString();
      return this.client
        .from(this.tableName)
        .select('*')
        .or(`${check}.lt.${dateString},${check}.is.null`)
        .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
    }
    catch (err) {
      console.error('Unexpected error during select', err, date, field);
      throw err;
    }
  }

  async findById(entityId: Identifier): Promise<DBBill | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', entityId)
        .maybeSingle()
      if (error) {
        console.error('Unexpected error during select', error);
        throw new Error('Unexpected error during select');
      }
      return data ? this.mapJson(data) : null;
    } catch (err) {
      console.error('Unexpected error during select:', err, entityId);
      throw err;
    }
  }
}