import { Identifier } from "@digitalaidseattle/core";

import { LegislativeDocument } from "../bill";
import { DAO } from "../DAO";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

export type DBBill = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    bill: LegislativeDocument
}

class IternalBillsDAO extends SupabaseDAO<DBBill> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Bills')
    }
}

export class BillsDB implements DAO<LegislativeDocument> {

    private static instance: BillsDB;

    public static getInstance(): BillsDB {
        if (!BillsDB.instance) {
            BillsDB.instance = new BillsDB();
        }
        return BillsDB.instance;
    }

    db_dao: SupabaseDAO<DBBill>;

    constructor() {
        this.db_dao = new IternalBillsDAO();
    }

    getAll(): Promise<LegislativeDocument[]> {
        return this.db_dao.getAll()
            .then(wrapped => wrapped.map(db => db.bill))
    }

    getById(id: Identifier): Promise<LegislativeDocument> {
        return this.db_dao.getById(id)
            .then(wrapped => wrapped.bill);
    }

    async upsert(entity: LegislativeDocument | LegislativeDocument[]): Promise<LegislativeDocument | LegislativeDocument[]> {
        const now = new Date();
        const uploads = (Array.isArray(entity) ? entity : [entity])
            .map(bb => ({
                id: bb.Id,
                updated_at: now,
                bill: bb
            } as DBBill));
        return Promise.all(uploads.map(up => this.db_dao.upsert(up)))
            .then(resps => resps.map(db => db.bill))
    }



}