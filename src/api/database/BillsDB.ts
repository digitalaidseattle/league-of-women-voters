import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";
import { SupabaseDAO } from "./SupabaseDAO";

export type DBBill = {
    id: Identifier,
    bill: any
}

export class BillsDB extends SupabaseDAO<DBBill> {

    private static instance: BillsDB;

    public static getInstance(): BillsDB {
        if (!BillsDB.instance) {
            BillsDB.instance = new BillsDB();
        }
        return BillsDB.instance;
    }


    constructor() {
        const client = SupabaseConfiguration.getInstance().getSupabaseClient();
        super(client, 'Bills')
    }


}