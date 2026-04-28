/**
 *  CommitteeDao.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { SupabaseConfiguration } from '@digitalaidseattle/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { LegislationInfo } from './bill';

export class CommitteeDao {
  private static instance: CommitteeDao;

  public static getInstance(): CommitteeDao {
    if (!CommitteeDao.instance) {
      CommitteeDao.instance = new CommitteeDao();
    }
    return CommitteeDao.instance;
  }

  client: SupabaseClient;
  biennium: string;

  private constructor() {
    const current = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
    if (current) {
      this.biennium = current;
    } else {
      throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required, but was not provided.");
    }
    this.client = SupabaseConfiguration.getInstance().getSupabaseClient()
  }

  public async getAll(): Promise<Committee[]> {
    return this.client.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommittees' },
      })
      .then((resp: any) => {
        if (resp.error) {
          throw resp.error;
        }
        return resp.data;
      });

  }

  public async getCommitteeMembers(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return this.client.functions
      .invoke("committee-services", {
        body: { operation: 'GetActiveCommitteeMembers', agency: agency, committeeName: committeeName },
      })
      .then((resp: any) => resp.data as Member[]);
  }

  public async getCommitteeReferralsByCommittee(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return this.client.functions
      .invoke("committee-services", {
        body: { operation: 'GetCommitteeReferralsByCommittee', biennium: this.biennium, agency: agency, committeeName: committeeName },
      })
      .then((resp: any) => resp.data as Member[]);
  }

  public async getInCommittee(
    agency: string,
    committeeName: string,
  ): Promise<LegislationInfo[]> {
    return this.client.functions
      .invoke("committee-services", {
        body: { operation: 'GetInCommittee', biennium: this.biennium, agency: agency, committeeName: committeeName },
      })
      .then((resp: any) => resp.data as LegislationInfo[]);
  }

}
