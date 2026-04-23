import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";
import { DAO } from "../DAO";

export type DBCommittee = {
    id: Identifier,
    created_at: Date,
    updated_at: Date,
    committee: Committee
}

class IternalCommitteeDAO extends SupabaseDAO<DBCommittee> {
    constructor() {
        super(SupabaseConfiguration.getInstance().getSupabaseClient(), 'Committees')
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

    db_dao: SupabaseDAO<DBCommittee>;

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

    // async getCommitteeMembers(
    //     agency: string,
    //     committeeName: string,
    // ): Promise<Member[]> {
    //     return this.client.functions
    //         .invoke("committee-services", {
    //             body: { operation: 'GetActiveCommitteeMembers', agency: agency, committeeName: committeeName },
    //         })
    //         .then((resp: any) => resp.data as Member[]);
    // }


}