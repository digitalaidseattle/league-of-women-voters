/**
 *  BillExporter.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import type { Bill } from "./bill";
import { BillsDB } from "./database/BillsDB";
import { EntityExporter } from "./EntityExporter";

export class BillExporter extends EntityExporter<Bill> {

  private static instance: BillExporter;

  public static getInstance(): BillExporter {
    if (!BillExporter.instance) {
      BillExporter.instance = new BillExporter();
    }
    return BillExporter.instance;
  }

  private constructor() {
    super(BillsDB.getInstance(),
      "bills_export",
      "Bills",
      [
        { key: 'BillId', header: 'Bill' },
        { key: 'Active', header: 'Active' },
        {
          key: 'InCommittee',
          header: 'In Committee',
          valueGetter: (bill: any) => bill.InCommittee?.Name ?? ""
        },
        { key: 'LegalTitle', header: 'Title' },
        {
          key: 'CurrentStatus',
          header: 'Bill History',
          valueGetter: (bill: any) => bill.CurrentStatus?.HistoryLine ?? ""
        },
        {
          key: 'CurrentStatus',
          header: 'Status',
          valueGetter: (bill: any) => bill.CurrentStatus?.Status ?? ""
        }
      ]);
  }

}