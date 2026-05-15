/**
 *  billService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { DataAccessOptions, PageInfo, QueryModel } from "@digitalaidseattle/core";
import type { Bill, LegislationInfo } from "./bill";
import { BillsDB } from "./database/BillsDB";
import { LegislatureService } from "./legislatureService";

export class BillService {
  private static instance: BillService;

  public static getInstance(): BillService {
    if (!BillService.instance) {
      BillService.instance = new BillService();
    }
    return BillService.instance;
  }

  dao: BillsDB;
  inCommitteeMap: Map<Committee, LegislationInfo[]> | null = null;

  private constructor() {
    this.dao = BillsDB.getInstance();
    this.fectchInCommittee();
  }

  async getInCommitteeMap(): Promise<Map<Committee, LegislationInfo[]>> {
    if (this.inCommitteeMap == null) {
      this.fectchInCommittee();
    }
    return this.inCommitteeMap!;
  }


  fectchInCommittee() {
    const legislatureService = LegislatureService.getInstance();

    legislatureService
      .getAll()
      .then(async committees => {
        Promise
          .all(committees.map(committee => legislatureService.getInCommittee(committee.Agency, committee.Name)))
          .then(resps => {
            const map = new Map<Committee, LegislationInfo[]>();
            for (let i = 0; i < committees.length; i++) {
              const committee = committees[i];
              map.set(committee, resps[i])
            }
            this.inCommitteeMap = map
          })
      })
  };

  async findInCommittee(bill: Bill): Promise<Committee | undefined> {
    const map = await this.getInCommitteeMap();
    for (const [committee, infos] of map.entries()) {
      if (infos) {
        if (infos.find(info => info.BillId === bill.BillId)) {
          return committee;
        }
      }
    }
    return undefined
  };


  async getAll(): Promise<Bill[]> {
    return this.dao.getAll();
  }

  async getById(id: string): Promise<Bill> {
    return this.dao.getById(id)
  }


  async findBillsBySponsor(sponsor: Member): Promise<Bill[]> {
    return this.dao.findByPrimarySponsor(sponsor.Id);
  }

  async find(queryModel: QueryModel, opts?: DataAccessOptions<Bill>): Promise<PageInfo<Bill>> {
    const pageInfo = await this.dao.find(queryModel, opts);
    const updated = [];
    const bills = pageInfo.rows;
    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      const committee = await this.findInCommittee(bill);
      updated.push({
        ...bill,
        InCommittee: committee
      })
    }
    return ({
      ...pageInfo,
      rows: updated
    })
  }


}