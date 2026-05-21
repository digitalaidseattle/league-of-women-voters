/**
*  calcSearchKey.ts
*
*  @copyright 2026 Digital Aid Seattle
*
*/

import { Bill } from "./types.ts";

export function calcSearchKey(bill: Bill): string {
    return [
        bill.BillNumber,
        bill.LegalTitle,
        bill.InCommittee ? bill.InCommittee.Name : undefined,
        bill.CurrentStatus ? bill.CurrentStatus.Status : undefined,
        bill.CurrentStatus ? bill.CurrentStatus.HistoryLine : undefined,
    ]
        .filter(term => !!term)
        .join(" ")
        .toLowerCase();
}