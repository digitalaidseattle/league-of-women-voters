/**
 *  billService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { DataAccessOptions, PageInfo, QueryModel } from "@digitalaidseattle/core";
import type { Bill } from "./bill";
import { BillsDB } from "./database/BillsDB";
import { Committee, Member } from "./committee";
import { LegislatureService } from "./legislatureService";
import { BillExporter } from "./billsExporter";

export class BillService {

  private static instance: BillService;

  public static getInstance(): BillService {
    if (!BillService.instance) {
      BillService.instance = new BillService();
    }
    return BillService.instance;
  }

  dao: BillsDB;

  private constructor() {
    this.dao = BillsDB.getInstance();
  }

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
    return this.dao.find(queryModel, opts);
  }

  getBillUrl(bill: Bill): string {
    const year = bill.Biennium.split('-')[0];
    const billNumber = bill.BillNumber
    return `https://app.leg.wa.gov/billsummary/?BillNumber=${billNumber}&Year=${year}`
  }

  async findInCommittee(bill: Bill): Promise<Committee | undefined> {
    return LegislatureService.getInstance()
      .getAll()
      .then(committees => {
        for (const committee of committees) {
          if (committee.InCommittee) {
            if (committee.InCommittee.find(info => info.BillId === bill.BillId)) {
              return committee;
            }
          }
        }
        return undefined;
      })
  };

  async exportData(queryModel: QueryModel): Promise<void> {
    return BillExporter.getInstance().exportData(queryModel);
  }

}