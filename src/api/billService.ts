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

  billsCache: LegislativeDocument[] = [];

  private constructor() {
  }

  async refreshCache(): Promise<void> {
    const bills = await BillDao.getInstance().getBills(DEFAULT_DOCUMENT_CLASS);
    // Removing for now, failing at WALeg at high rate
    // for (const bill of bills) {
    //   try {
    //     const billDetails = await BillDao.getInstance().getBillDetails(bill.Name!);
    //     bill.PrimeSponsorID = billDetails.PrimeSponsorID;
    //   } catch (error) {
    //     console.error('refreshCache', error);
    //     throw error
    //   }
    // }
    this.billsCache = bills;
  }

  public async getBills(): Promise<LegislativeDocument[]> {
    return this.billsCache;
  }

  public async findBillsBySponsor(sponsor: Member): Promise<LegislativeDocument[]> {
    return this.billsCache.filter(b => b.PrimeSponsorID === sponsor.Id)
  }

}

