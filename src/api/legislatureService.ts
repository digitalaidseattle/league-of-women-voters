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

  public async getSponsors(): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("sponsors", {
        body: { biennium: "2023-24" },
      })
      .then((resp) => resp.data as Member[]);
  }

  public async getCommittees(): Promise<Committee[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommittees'},
      })
      .then((resp) => resp.data as Committee[]);
  }

  public async getCommitteeMembers(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommitteeMembers', agency: agency, committeeName: committeeName },
      })
      .then((resp) => resp.data as Member[]);
  }

  public async GetCommitteeReferralsByCommittee(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetCommitteeReferralsByCommittee', biennium: '2023-24', agency: agency, committeeName: committeeName },
      })
      .then((resp) => resp.data as Member[]);
  }
}

export { LegislatureService };
