/**
 *  billService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { DataAccessOptions, PageInfo, QueryModel } from "@digitalaidseattle/core";
import type { Bill } from "./bill";
import { BillsDB } from "./database/BillsDB";

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

}