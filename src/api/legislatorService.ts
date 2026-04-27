import { Identifier } from "@digitalaidseattle/core";
import { DAO } from "./DAO";
import { SponsorsDB } from "./database/SponsorsDB";

class LegislatorService {
    private static instance: LegislatorService;

    public static getInstance(): LegislatorService {
        if (!LegislatorService.instance) {
            LegislatorService.instance = new LegislatorService();
        }
        return LegislatorService.instance;
    }

    biennium: string;
    dao: DAO<Member>;

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
        return this.dao.getAll()
    }

    async getById(id: Identifier): Promise<Member> {
        return this.dao.getById(id);
    }
}

export { LegislatorService };
