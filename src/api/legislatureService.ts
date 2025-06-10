import { supabaseClient } from "@digitalaidseattle/supabase";

class LegislatureService {
  private static instance: LegislatureService;

  private constructor() {}

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  public async getCommittees(): Promise<Committee[]> {
    return supabaseClient.functions
      .invoke("committees")
      .then((resp) => resp.data as Committee[]);
  }

  public async getCommitteeMembers(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("committee-members", {
        body: { agency: agency, committeeName: committeeName },
      })
      .then((resp) => resp.data as Member[]);
  }

}

export { LegislatureService };
