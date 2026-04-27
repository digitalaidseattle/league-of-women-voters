
import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";
import { DAO } from "./DAO";

export class LegislatorDao implements DAO<Member> {

    private static instance: LegislatorDao;

    public static getInstance(): LegislatorDao {
        if (!LegislatorDao.instance) {
            LegislatorDao.instance = new LegislatorDao();
        }
        return LegislatorDao.instance;
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
        return SupabaseConfiguration.getInstance().getSupabaseClient().functions
            .invoke("sponsors", {
                body: { biennium: this.biennium },
            })
            .then((resp: any) => {
                return resp.data.filter((item: any) => item !== null && item !== undefined);
            });
    }

    async getById(id: Identifier): Promise<Member> {
        const legislators = await this.getAll();
        console.log(legislators, id)
        const found = legislators.find(l => l.Id === id);
        if (found) {
            return found;
        }
        throw new Error(`Could not find legislator for id = ${id}`);
    }

}

