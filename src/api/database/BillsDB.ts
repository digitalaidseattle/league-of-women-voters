import { Identifier } from "@digitalaidseattle/core";
import { getConfiguration } from "../configuration";
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
        super(getConfiguration().client, 'Bills')
    }


}