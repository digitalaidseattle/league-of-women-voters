/* eslint-disable @typescript-eslint/no-explicit-any */
import { Identifier } from "@digitalaidseattle/core";
import { CommitteeDao } from "./committeeDao";
import { DAO } from "./DAO";
import { CommitteesDB } from "./database/CommitteesDB";

class LegislatureService {

  private static instance: LegislatureService;

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  dao: DAO<Committee>;

  private constructor() {
    this.dao = CommitteesDB.getInstance();
  }

  async getAll(): Promise<Committee[]> {
    return this.dao.getAll();
  }

  async getById(id: Identifier) {
    return this.dao.getById(id);
  }

  // FIXME members need to be added to committees
  async findCommitteesByMember(member: Member): Promise<Committee[]> {
    const committees = await this.getAll();
    return committees.filter(committee =>
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
