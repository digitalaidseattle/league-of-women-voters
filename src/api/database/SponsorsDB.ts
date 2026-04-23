import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";
import { DAO } from "../DAO";

type DBSponsor = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    sponsor: Member
}

class IternalSponsoDAO extends SupabaseDAO<DBSponsor> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Sponsors')
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

    db_dao: SupabaseDAO<DBSponsor>;

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
                updated_at: now,
                sponsor: mm
            } as DBSponsor));
        return Promise.all(uploads.map(up => this.db_dao.upsert(up)))
            .then(resps => resps.map(sponsorDB => sponsorDB.sponsor))
    }

}