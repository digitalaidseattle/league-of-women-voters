/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommitteeDao } from "./committeeDao";

class LegislatureService {
  private static instance: LegislatureService;

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  committeeCache: Committee[] = [];

  private constructor() {
  }

  async refreshCache(): Promise<void> {
    const committees = await CommitteeDao.getInstance().getCommittees();
    committees.forEach(async committee => {
      const members = await CommitteeDao.getInstance().getCommitteeMembers(committee.Agency, committee.Name);
      committee.Members = members;
    })
    this.committeeCache = committees;
  }

  public async getCommittees(): Promise<Committee[]> {
    return this.committeeCache;
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
    // TODO replace with cache lookup
    return CommitteeDao.getInstance().getCommitteeMembers(agency, committeeName);
  }

  public async GetCommitteeReferralsByCommittee(
    agency: string,
    committeeName: string,
  ): Promise<Member[]> {
    return CommitteeDao.getInstance().getCommitteeReferralsByCommittee(agency, committeeName);
  }

}

export { LegislatureService };
