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
        { key: 'BillId', header: 'Bill ID' },
        { key: 'BillNumber', header: 'Bill Number' },
        { key: 'InCommittee', header: 'Committee Name' },
        { key: 'OriginalAgency', header: 'Original Agency' },
        { key: 'LegalTitle', header: 'Legal Title' },
        {
          key: 'CurrentStatus',
          header: 'History Line',
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