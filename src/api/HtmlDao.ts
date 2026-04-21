
import { supabaseClient } from "@digitalaidseattle/supabase";

export class HtmlDao {

    private static instance: HtmlDao;

    public static getInstance(): HtmlDao {
        if (!HtmlDao.instance) {
            HtmlDao.instance = new HtmlDao();
        }
        return HtmlDao.instance;
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
