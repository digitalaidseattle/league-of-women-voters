import { SupabaseConfiguration, SupabaseDAO } from "npm:@digitalaidseattle/supabase";
import { Bill, DBBill, DBCommittee } from "./types.ts";

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

}