/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient } from "@digitalaidseattle/supabase";
import type { LegislativeDocument } from "./bill";
import type { LegBill } from "./openStatesBill";


const CURRENT_BIENNIUM = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
if (!CURRENT_BIENNIUM) {
  throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required but was not provided.");
}


class LegislatureService {
  private static instance: LegislatureService;

  private constructor() { }

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  public async getSponsors(): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("sponsors", {
        body: { biennium: CURRENT_BIENNIUM },
      })
      .then((resp: any) => resp.data as Member[]);
  }

  public async getCommittees(): Promise<Committee[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommittees' },
      })
      .then((resp: any) => resp.data as Committee[]);
  }

  public async getCommitteeMembers(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommitteeMembers', agency: agency, committeeName: committeeName },
      })
      .then((resp: any) => resp.data as Member[]);
  }

  public async GetCommitteeReferralsByCommittee(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return supabaseClient.functions
      .invoke("committee-services", {
        body: { operation: 'GetCommitteeReferralsByCommittee', biennium: CURRENT_BIENNIUM, agency: agency, committeeName: committeeName },
      })
      .then((resp: any) => resp.data as Member[]);
  }

  public async getBills(
    documentClass: string,
  ): Promise<LegislativeDocument[]> {
    return supabaseClient.functions
      .invoke("bills-services", {
        body: { biennium: CURRENT_BIENNIUM, documentClass },
      })
      .then((resp) => resp.data as LegislativeDocument[]);
  }
  public async getOpenStatesBills(
  page: number = 1,
  limit: number = 5
): Promise<LegBill[]> {
  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "openstates-bills-services",
      {
        body: {
          page,
          limit
        },
      }
    );

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Failed to fetch bills: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      console.warn("No data returned from openstates-bills-services");
      return [];
    }

    // Handle if data is wrapped in another object
    const bills = Array.isArray(data) ? data : (data.bills || data.results || []);
    
    console.log("Fetched bills:", bills);
    return bills as LegBill[];
    
  } catch (error) {
    console.error("Error in getOpenStatesBills:", error);
    throw error;
  }
}

}


export { LegislatureService };
