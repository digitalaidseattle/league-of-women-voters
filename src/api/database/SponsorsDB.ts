import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";
import { DAO } from "../DAO";

type DBSponsor = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    info_update: Date,
    sponsor: Member
}

class IternalSponsoDAO extends SupabaseDAO<DBSponsor> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Sponsors')
    }

    async findLastUpdateBefore(date: Date, field?: string): Promise<DBSponsor[]> {
        const check = field ?? 'updated_at';
        const dateString = date.toISOString();
        return this.client
            .from(this.tableName)
            .select('*')
            .or(`${check}.lt.${dateString},${check}.is.null`)
            .then(resp => resp.data as DBSponsor[])
    }
}

export class SponsorsDB implements DAO<Member> {

    private static instance: SponsorsDB;

    public static getInstance(): SponsorsDB {
        if (!SponsorsDB.instance) {
            SponsorsDB.instance = new SponsorsDB();
        }
        return SponsorsDB.instance;
    }

    db_dao: IternalSponsoDAO;

    constructor() {
        this.db_dao = new IternalSponsoDAO();
    }

    getAll(): Promise<Member[]> {
        return this.db_dao.getAll()
            .then(wrapped => wrapped.map(sponsorDB => sponsorDB.sponsor))
    }

    getById(id: Identifier): Promise<Member> {
        return this.db_dao.getById(id)
            .then(wrapped => wrapped.sponsor);
    }

    async upsert(entity: Member | Member[]): Promise<Member | Member[]> {
        const now = new Date();
        const uploads = (Array.isArray(entity) ? entity : [entity])
            .map(mm => ({
                id: mm.Id,
                sponsor: mm,
                updated_at: now
            } as DBSponsor));
        return Promise.all(uploads.map(up => this.db_dao.upsert(up)))
            .then(resps => resps.map(sponsorDB => sponsorDB.sponsor))
    }

    async findLastUpdateBefore(date: Date, field?: string): Promise<Member[]> {
        return this.db_dao.findLastUpdateBefore(date, field)
            .then(resps => resps.map(sponsorDB => sponsorDB.sponsor))
    }

    async updateInfo(entity: Member | Member[]): Promise<Member | Member[]> {
        const now = new Date();
        const uploads = (Array.isArray(entity) ? entity : [entity])
            .map(mm => ({
                sponsor: mm,
                info_update: now,
            } as DBSponsor));
        return Promise.all(uploads.map(up => this.db_dao.upsert(up)))
            .then(resps => resps.map(sponsorDB => sponsorDB.sponsor))
    }
}