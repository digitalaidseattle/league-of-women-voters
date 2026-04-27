import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";
import { DAO } from "../DAO";

export type DBCommittee = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    membership_update: Date,
    leadership_update: Date,
    committee: Committee
}

class IternalCommitteeDAO extends SupabaseDAO<DBCommittee> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Committees')
    }

    async findLastUpdateBefore(date: Date, field?: string): Promise<DBCommittee[]> {
        const check = field ?? 'updated_at';
        const dateString = date.toISOString();
        return this.client
            .from(this.tableName)
            .select('*')
            .or(`${check}.lt.${dateString},${check}.is.null`)
            .then(resp => resp.data as DBCommittee[])
    }
}

export class CommitteesDB implements DAO<Committee> {

    private static instance: CommitteesDB;

    public static getInstance(): CommitteesDB {
        if (!CommitteesDB.instance) {
            CommitteesDB.instance = new CommitteesDB();
        }
        return CommitteesDB.instance;
    }

    db_dao: IternalCommitteeDAO;

    constructor() {
        this.db_dao = new IternalCommitteeDAO();
    }

    getAll(): Promise<Committee[]> {
        return this.db_dao.getAll()
            .then(wrapped => wrapped.map(sponsorDB => sponsorDB.committee))
    }

    getById(id: Identifier): Promise<Committee> {
        return this.db_dao.getById(id)
            .then(wrapped => wrapped.committee);
    }

    async findLastUpdateBefore(date: Date, field?: string): Promise<Committee[]> {
        return this.db_dao.findLastUpdateBefore(date, field)
            .then(resps => resps.map(sponsorDB => sponsorDB.committee))
    }

    async upsert(entity: Committee | Committee[]): Promise<Committee | Committee[]> {
        const now = new Date();
        const uploads = (Array.isArray(entity) ? entity : [entity])
            .map(cc => ({
                id: cc.Id,
                updated_at: now,
                committee: cc
            } as DBCommittee));
        return Promise.all(uploads.map(up => this.db_dao.upsert(up)))
            .then(resps => resps.map(db => db.committee))
    }

    async updateLeadership(entity: Committee): Promise<Committee> {
        const now = new Date();
        const current = await this.db_dao.getById(entity.Id);
        const up = (
            {
                ...current,
                committee: entity,
                leadership_update: now
            })
        return this.db_dao.upsert(up)
            .then(sponsorDB => sponsorDB.committee)
    }


    async updateMembership(entity: Committee): Promise<Committee> {
        const now = new Date();
        const current = await this.db_dao.getById(entity.Id);
        const up = (
            {
                ...current,
                committee: entity,
                membership_update: now
            })
        return this.db_dao.upsert(up)
            .then(sponsorDB => sponsorDB.committee)
    }

}