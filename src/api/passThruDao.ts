
import { supabaseClient } from "@digitalaidseattle/supabase";

export class PassThruDao {

    private static instance: PassThruDao;

    public static getInstance(): PassThruDao {
        if (!PassThruDao.instance) {
            PassThruDao.instance = new PassThruDao();
        }
        return PassThruDao.instance;
    }

    private constructor() {
    }

    async getHtml(url: string): Promise<string> {
        return supabaseClient.functions
            .invoke("legislature-services", {
                body: { url: url },
            })
            .then((resp: any) => resp.data);
    }

}

