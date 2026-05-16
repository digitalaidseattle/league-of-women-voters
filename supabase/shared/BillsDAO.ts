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
    super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Bills');
  }

  async findLastUpdateBefore(date: Date, field?: string): Promise<DBBill[]> {
    const check = field ?? 'updated_at';
    const dateString = date.toISOString();
    return this.client
      .from(this.tableName)
      .select('*')
      .or(`${check}.lt.${dateString},${check}.is.null`)
      .then((resp: any) => resp.data as DBBill[])
  }

  async findById(entityId: Identifier): Promise<DBBill | null> {
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