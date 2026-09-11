/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataAccessOptions, Entity, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";
import { Committee, Member } from "./committee";
import { CommitteesDB } from "./database/CommitteesDB";
import { LegislatureExporter } from "./legislatureExporter";


export type FlattenCommittee = Entity & {
  SearchKey: string;
  Agency: string;
  Name: string;
  Phone: string;
  Chair: string;
  ViceChair: string;
  MinorityChair: string;
  AsstMinorityChair: string;
  MemberCount: number;
}

class LegislatureService {

  private static instance: LegislatureService;

  public static getInstance(): LegislatureService {
    if (!LegislatureService.instance) {
      LegislatureService.instance = new LegislatureService();
    }
    return LegislatureService.instance;
  }

  dao: CommitteesDB;

  private constructor() {
    this.dao = CommitteesDB.getInstance();
  }

  async getAll(): Promise<Committee[]> {
    return this.dao.getAll();
  }

  async getById(id: Identifier) {
    return this.dao.getById(id);
  }

  async find(queryModel: QueryModel, opts?: DataAccessOptions<Committee>): Promise<PageInfo<Committee>> {
    return this.dao.find(queryModel, opts);
  }

  async findCommitteesByMember(member: Member): Promise<Committee[]> {
    const committees = await this.getAll();
    return committees.filter(committee =>
      (committee.Members ?? []).find(mem => mem.Name === member.Name) !== undefined
    )
  }

  async exportData(queryModel: QueryModel): Promise<void> {
    return LegislatureExporter.getInstance().exportData(queryModel);
  }

  getLeadershipName(committee: Committee, role: string) {
    const leadership = committee.Leadership ?? [];
    const found = leadership.filter((leader) => {
      const normalizedRole = leader.role.toLowerCase();
      return normalizedRole === role;
    });
    return found.map(member => this.formatPersonName(member?.name ?? "")).join(', ');
  }

  formatPersonName(name: string) {
    const [lastName, firstName] = name.split(",").map((part) => part.trim());
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return name;
  }

  transformCommittee(committee: Committee): FlattenCommittee {
    const flattened = {
      id: committee.id ?? committee.Id,
      SearchKey: '',
      Agency: committee.Agency,
      Name: committee.Name,
      Phone: committee.Phone,
      Chair: this.getLeadershipName(committee, 'chair'),
      ViceChair: this.getLeadershipName(committee, 'vice chair'),
      MinorityChair: this.getLeadershipName(committee, 'ranking minority member'),
      AsstMinorityChair: this.getLeadershipName(committee, 'assistant ranking minority member'),
      MemberCount: committee.Members ? committee.Members.length : 0
    }
    flattened.SearchKey = this.calculateSearchKey(flattened);
    return flattened;
  }

  calculateSearchKey(committee: FlattenCommittee): string {
    return [
      committee.Agency.toLowerCase(),
      committee.Name.toLowerCase(),
      committee.Chair.toLowerCase(),
      committee.ViceChair.toLowerCase(),
      committee.MinorityChair.toLowerCase(),
      committee.AsstMinorityChair.toLowerCase()
    ].join(', ')
  }

  filterByChamber(committee: FlattenCommittee, chamber: string) {
    if (!chamber || chamber === 'all') {
      return true;
    }
    return chamber === committee.Agency.toLowerCase();
  }

  filterBySearchKey(committee: FlattenCommittee, search: string) {
    if (!search || search === '') {
      return true;
    }
    return committee.SearchKey.includes(search.trim().toLowerCase());
  }

}


export { LegislatureService };
