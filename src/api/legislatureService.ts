/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataAccessOptions, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";
import { Committee, Member } from "./committee";
import { CommitteesDB } from "./database/CommitteesDB";
import { LegislatureExporter } from "./legislatureExporter";

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
}


export { LegislatureService };
