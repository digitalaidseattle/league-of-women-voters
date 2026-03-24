/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommitteeDao } from "./committeeDao";
import { CommitteesDB } from "./database/CommitteesDB";

class LegislatureService {
  private static instance: LegislatureService;

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  private constructor() {
  }

  async getCommittees(): Promise<Committee[]> {
    return CommitteeDao.getInstance().getAll();
  }

  async findCommitteesByMember(member: Member): Promise<Committee[]> {
    const dbCommittees = await CommitteesDB.getInstance().getAll();
    const mapped = dbCommittees.map(db => db.committee as Committee);
    return mapped.filter(committee =>
      (committee.Members ?? []).find(mem => mem.Name === member.Name) !== undefined
    )
  }

  async getCommitteeMembers(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return CommitteeDao.getInstance().getCommitteeMembers(agency, committeeName);
  }

  async GetCommitteeReferralsByCommittee(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return CommitteeDao.getInstance().getCommitteeReferralsByCommittee(agency, committeeName);
  }

}

export { LegislatureService };
