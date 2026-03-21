import { Identifier } from "@digitalaidseattle/core";
import { supabaseClient } from "@digitalaidseattle/supabase";

// const example = {
//     id: "ocd-person/ea5ab101-aa06-49f0-95b7-81bf9f96967f",
//     name: "Hunter Abell",
//     party: "Republican",
//     current_role: {
//         title: "Representative",
//         org_classification: "lower",
//         district: "7",
//         division_id: "ocd-division/country:us/state:wa/sldl:7"
//     },
//     jurisdiction: {
//         id: "ocd-jurisdiction/country:us/state:wa/government",
//         name: "Washington",
//         classification: "state"
//     },
//     given_name: "Hunter",
//     family_name: "Abell",
//     image: "https://www.wsba.org/images/default-source/wsba-image-library/bog/hunter-abell_-2017_linkedin.jpg?sfvrsn=5c4702f1_0",
//     email: "hunter.abell@leg.wa.gov",
//     gender: "Male",
//     birth_date: "",
//     death_date: "",
//     extras: {},
//     created_at: "2025-01-14T19:16:06.957962+00:00",
//     updated_at: "2025-07-18T02:46:57.508347+00:00",
//     openstates_url: "https://openstates.org/person/hunter-abell-78DeKxlZCawQBTcU5qPysZ/"
// }


class LegislatorService {
    private static instance: LegislatorService;

    public static getInstance(): LegislatorService {
        if (!LegislatorService.instance) {
            LegislatorService.instance = new LegislatorService();
        }
        return LegislatorService.instance;
    }

    biennium: string;
    cache: any[] | null = null;

    constructor() {
        const current = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
        if (current) {
            this.biennium = current;
        } else {
            throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required, but was not provided.");
        }
    }

    async getAll(): Promise<Member[]> {
        if (this.cache === null) {
            return supabaseClient.functions
                .invoke("sponsors", {
                    body: { biennium: this.biennium },
                })
                .then((resp: any) => {
                    const all = resp.data.filter((item: any) => item !== null && item !== undefined);
                    this.cache = all;
                    return this.cache;
                });

        }
        return this.cache;
    }

    async getById(id: Identifier): Promise<Member> {
        return this.getAll()
            .then(all => {
                const found = all.find(legislator => legislator.Id === Number(id));
                if (!found) {
                    throw new Error(`Could not find legilator for id = ${id}`);
                } else {
                    return found;
                }
            });
    }
}

export { LegislatorService }