/**
 *  CommitteeDao.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { getConfiguration } from './configuration';

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
    this.client = getConfiguration().client;
  }

  public async getCommittees(): Promise<Committee[]> {
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

  public async findCommitteesByMember(member: Member): Promise<Committee[]> {
    return this.getCommittees()
      .then(committees => {
        return (committees ?? []).filter(committee => {
          return committee.Members.find(mem => mem.Name === member.Name) !== undefined
        })
      })
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

}
