import { Identifier } from "@digitalaidseattle/core";
import { LegislatorDao } from "./legislatorDao";

class LegislatorService {
    private static instance: LegislatorService;

    public static getInstance(): LegislatorService {
        if (!LegislatorService.instance) {
            LegislatorService.instance = new LegislatorService();
        }
        return LegislatorService.instance;
    }

    biennium: string;

    constructor() {
        const current = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
        if (current) {
            this.biennium = current;
        } else {
            throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required, but was not provided.");
        }
    }

    async getAll(): Promise<Member[]> {
        return LegislatorDao.getInstance().getAll()
    }

    async getById(id: Identifier): Promise<Member> {
        return LegislatorDao.getInstance().getById(id)
    }
}

export { LegislatorService };
