import { Identifier } from "@digitalaidseattle/core";
import { getConfiguration } from "../configuration";
import { SupabaseDAO } from "./SupabaseDAO";

export type DBCommittee = {
    id: Identifier,
    committee: any
}

export class CommitteesDB extends SupabaseDAO<DBCommittee> {

    private static instance: CommitteesDB;

    public static getInstance(): CommitteesDB {
        if (!CommitteesDB.instance) {
            CommitteesDB.instance = new CommitteesDB();
        }
        return CommitteesDB.instance;
    }


    constructor() {
        super(getConfiguration().client, 'Committees')
    }

}