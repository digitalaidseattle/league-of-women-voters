/**
 *  billService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import type { LegislativeDocument } from "./bill";
import { BillDao } from './billDao';
import { DAO } from "./DAO";
import { BillsDB } from "./database/BillsDB";

const DEFAULT_DOCUMENT_CLASS = "Bills";

export class BillService {
  private static instance: BillService;

  public static getInstance(): BillService {
    if (!BillService.instance) {
      BillService.instance = new BillService();
    }
    return BillService.instance;
  }

  dao: DAO<LegislativeDocument>;
  private constructor() {
    this.dao = BillsDB.getInstance();
  }

  async getAll(documentClass?: string): Promise<LegislativeDocument[]> {
    if (documentClass) {
      return BillDao.getInstance().getBills(documentClass ?? DEFAULT_DOCUMENT_CLASS);
    } else {
      return this.dao.getAll();
    }
  }

  async getById(id: string): Promise<LegislativeDocument> {
    const bills = await this.getAll()
    const found = bills.find(bill => bill.Id === id);
    if (found) {
      return found;
    }
    throw new Error(`Could not find bill for id = ${id}`);
  }

  async findBillsBySponsor(sponsor: Member): Promise<LegislativeDocument[]> {
    const bills = await this.dao.getAll();
    return bills.filter(b => {
      const sponsorIds = (b.Sponsors ?? []).map(s => s.Id);
      return sponsorIds.includes(sponsor.Id);
    })
  }

}