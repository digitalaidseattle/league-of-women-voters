import { Identifier } from "@digitalaidseattle/core";
import { getConfiguration } from "../configuration";
import { SupabaseDAO } from "./SupabaseDAO";

export type DBSponsor = {
    id: Identifier,
    sponsor: any
}

export class SponsorsDB extends SupabaseDAO<DBSponsor> {

    private static instance: SponsorsDB;

    public static getInstance(): SponsorsDB {
        if (!SponsorsDB.instance) {
            SponsorsDB.instance = new SponsorsDB();
        }
        return SponsorsDB.instance;
    }


    constructor() {
        super(getConfiguration().client, 'Sponsors', {
            mapper:
                (json) => ({
                    ...json.sponsor,
                    Address: json.sponsor.address,
                    Assistant: json.sponsor.assistant,
                })
        })
    }

}