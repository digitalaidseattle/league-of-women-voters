import { Identifier } from "@digitalaidseattle/core";
import { DAO } from "./DAO";
import { DBSponsor, SponsorsDB } from "./database/SponsorsDB";

class LegislatorService {
    private static instance: LegislatorService;

    public static getInstance(): LegislatorService {
        if (!LegislatorService.instance) {
            LegislatorService.instance = new LegislatorService();
        }
        return LegislatorService.instance;
    }

    biennium: string;
    dao: DAO<DBSponsor>;

    constructor() {
        const current = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
        if (current) {
            this.biennium = current;
        } else {
            throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required, but was not provided.");
        }
        this.dao = SponsorsDB.getInstance();
    }

    async getAll(): Promise<Member[]> {
        return SponsorsDB.getInstance().getAll()
            .then(dbSponsors => dbSponsors.map(sponsorDB => sponsorDB.sponsor));
    }

    async getById(id: Identifier): Promise<Member> {
        return SponsorsDB.getInstance().getById(id)
            .then(sponsorDB => sponsorDB.sponsor as Member);
    }
}

export { LegislatorService };
