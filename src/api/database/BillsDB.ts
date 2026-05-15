import { DataAccessOptions, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";

import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";
import { Bill } from "../bill";
import { DAO } from "../DAO";

export type DBBill = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    bill: Bill,
    OriginalAgency?: string,
    PrimeSponsorID?: number
}

class IternalBillsDAO extends SupabaseDAO<DBBill> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Bills')
    }

    async findByPrimarySponsor(sponsorId: Identifier): Promise<DBBill[]> {
        return this.client
            .from(this.tableName)
            .select(this.getSelect({}))
            .eq("PrimeSponsorID", sponsorId)
            .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
    }

}

export class BillsDB implements DAO<Bill> {

    private static instance: BillsDB;

    public static getInstance(): BillsDB {
        if (!BillsDB.instance) {
            BillsDB.instance = new BillsDB();
        }
        return BillsDB.instance;
    }

    db_dao: IternalBillsDAO;

    constructor() {
        this.db_dao = new IternalBillsDAO();
    }

    getAll(): Promise<Bill[]> {
        return this.db_dao.getAll({ count: 5000 })
            .then(wrapped => wrapped.map(db => db.bill))
    }

    getById(id: Identifier): Promise<Bill> {
        return this.db_dao.getById(id)
            .then(wrapped => wrapped.bill);
    }

    async upsert(entity: Bill): Promise<Bill> {
        const now = new Date();
        const wrapper = {
            id: entity.BillId,
            updated_at: now,
            bill: entity
        } as DBBill;
        return this.db_dao.upsert(wrapper)
            .then(resp => resp.bill)
    }

    async find(queryModel: QueryModel, opts?: DataAccessOptions<Bill>): Promise<PageInfo<Bill>> {
        return this.db_dao
            .find(queryModel, opts as unknown as DataAccessOptions<DBBill>)
            .then(pageInfo => {
                return ({
                    ...pageInfo,
                    rows: pageInfo.rows.map(dbBill => dbBill.bill)
                })
            });
    }

    async findByPrimarySponsor(sponsorId: Identifier): Promise<Bill[]> {
        return this.db_dao
            .findByPrimarySponsor(sponsorId)
            .then(dbBills => dbBills.map(dbBill => dbBill.bill))
    }
}