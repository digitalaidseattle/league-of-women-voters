import { DataAccessOptions, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";
import { Member } from "./committee";
import { PreferencesDB } from "./database/PreferencesDB";
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

    dao: SponsorsDB;

    constructor() {
        this.dao = SponsorsDB.getInstance();
    }

    async getCurrentBiennium(): Promise<string> {
        return PreferencesDB.getInstance().getCurrentBiennium();
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

    async exportData(queryModel: QueryModel, visibleHeaders?: string[]): Promise<void> {
        return LegislatorExporter.getInstance().exportData(queryModel, visibleHeaders);
    }

    getAssistantName(row: Member): string {
        return (row.LegislativeAssistant ?? []).map((la: { name: string }) => la.name).join(', ');
    }
}

export { LegislatorService };
