import { Identifier } from "@digitalaidseattle/core";
import { getConfiguration } from "../configuration";
import { DataAccessOptions, SupabaseDAO } from "./SupabaseDAO";

export type DBSponsor = {
    id: Identifier,
    lastUpdated: Date,
    sponsor: Sponsor
}

export class SponsorsDB extends SupabaseDAO<Member> {

    private static instance: SponsorsDB;

    public static getInstance(): SponsorsDB {
        if (!SponsorsDB.instance) {
            SponsorsDB.instance = new SponsorsDB();
        }
        return SponsorsDB.instance;
    }

    constructor() {
        super(getConfiguration().client, 'Sponsors',
            {
                json2Entity:
                    (json) => ({
                        ...json.sponsor,
                        Address: json.sponsor.address,
                        Assistant: json.sponsor.assistant,
                    }),
                entity2Json:
                    (entity) => ({
                        id: entity.Id,
                        sponsor: {
                            ...entity,
                            address: entity.Address,
                            assistant: entity.Assistant
                        }
                    })
            })
    }

    async upsert(entity: Member | Member[], opts?: DataAccessOptions<Member>): Promise<Member | Member[]> {
        const upload = Array.isArray(entity) ? entity : [entity]
            .map(mm => ({
                ...mm,
                lastUpdated: Date.now()
            }));
        return super.upsert(upload, opts);
    }

}