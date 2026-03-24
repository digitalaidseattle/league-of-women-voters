/**
 *  billService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import type { LegislativeDocument } from "./bill";
import { BillDao } from './billDao';

const DEFAULT_DOCUMENT_CLASS = "Bills";

export class BillService {
  private static instance: BillService;

  public static getInstance(): BillService {
    if (!BillService.instance) {
      BillService.instance = new BillService();
    }
    return BillService.instance;
  }

  private constructor() {
  }

  async getAll(documentClass?: string): Promise<LegislativeDocument[]> {
    return BillDao.getInstance().getBills(documentClass ?? DEFAULT_DOCUMENT_CLASS);
  }

  async getById(id: string): Promise<LegislativeDocument> {
    const bills = await this.getAll()
    const found = bills.find(bill => bill.Id === id);
    if (found) {
      return found;
    }
    throw new Error(`Could not find bill for id = ${id}`);
  }

  // FIXME bills need Sponsors populated
  async findBillsBySponsor(sponsor: Member): Promise<LegislativeDocument[]> {
    const bills = await this.getAll();
    return bills.filter(b => {
      const sponsorIds = (b.Sponsors ?? []).map(s => s.Id);
      return sponsorIds.includes(sponsor.Id);
    })
  }



}