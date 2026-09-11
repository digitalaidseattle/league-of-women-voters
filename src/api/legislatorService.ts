import { DataAccessOptions, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";
import { Member } from "./committee";
import { SponsorsDB } from "./database/SponsorsDB";
import { LegislatorExporter } from "./legislatorExporter";

class LegislatorService {

    private static instance: LegislatorService;

    public static getInstance(): LegislatorService {
        if (!LegislatorService.instance) {
            LegislatorService.instance = new LegislatorService();
        }
        return LegislatorService.instance;
    }

    biennium: string;
    dao: SponsorsDB;

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

    async find(queryModel: QueryModel, opts?: DataAccessOptions<Member>): Promise<PageInfo<Member>> {
        return this.dao.find(queryModel, opts);
    }

    async exportData(queryModel: QueryModel): Promise<void> {
        return LegislatorExporter.getInstance().exportData(queryModel);
    }

    getAssistantName(row: Member): string {
        return (row.LegislativeAssistant ?? []).map((la: { name: string }) => la.name).join(', ');
    }
}

export { LegislatorService };
