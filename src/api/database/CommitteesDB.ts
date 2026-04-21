import { Identifier } from "@digitalaidseattle/core";
import { getConfiguration } from "../configuration";
import { SupabaseDAO } from "./SupabaseDAO";

export type DBCommittee = {
    id: Identifier,
    lastUpdated: Date,
    committee: Committee
}

export class CommitteesDB extends SupabaseDAO<Committee> {

    private static instance: CommitteesDB;

    public static getInstance(): CommitteesDB {
        if (!CommitteesDB.instance) {
            CommitteesDB.instance = new CommitteesDB();
        }
        return CommitteesDB.instance;
    }

    constructor() {
        super(getConfiguration().client, 'Committees',
            {
                json2Entity:
                    (json) => ({
                        ...json.committee
                    }),
                entity2Json:
                    (entity) => ({
                        id: entity.Id,
                        committee: {
                            ...entity
                        },
                        lastUpdated: Date.now()
                    })
            })

    }

    async getCommitteeMembers(
        agency: string,
        committeeName: string,
    ): Promise<Member[]> {
        return this.client.functions
            .invoke("committee-services", {
                body: { operation: 'GetActiveCommitteeMembers', agency: agency, committeeName: committeeName },
            })
            .then((resp: any) => resp.data as Member[]);
    }


}