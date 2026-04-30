/**
 *  bills.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import type { LegislativeDocument } from "../api/bill";
import { deriveDocumentLink, extractBillNumber, inferChamber, summarizeSponsors } from "./bills";

describe("bills", () => {
    const bill = (overrides: Partial<LegislativeDocument> = {}): LegislativeDocument => ({
        Id: "test",
        BillId: "test",
        ...overrides,
    });

    it("deriveDocumentLink", () => {
        expect(deriveDocumentLink(bill()))
            .toStrictEqual({ "label": "", "url": undefined });
        expect(deriveDocumentLink(bill({ Description: 'BILL', Url: 'EARL' })))
            .toStrictEqual({ "label": "View document", "url": "EARL" });
    });

    it("inferChamber", () => {
        expect(inferChamber(bill())).toBe("Unknown");
        expect(inferChamber(bill({ Chamber: 'HOUSE' }))).toBe("House");
        expect(inferChamber(bill({ Chamber: 'Joint' }))).toBe("Joint");

        expect(inferChamber(bill({ OriginatingAgency: 'House' }))).toBe("House");
        expect(inferChamber(bill({ Name: 'SB101' }))).toBe("Senate");
    });

    it("extractBillNumber", () => {
        expect(extractBillNumber()).toBe(undefined);
        expect(extractBillNumber('SB101')).toBe('101');
        expect(extractBillNumber(null, bill())).toBe(undefined);
        expect(extractBillNumber(null, bill({ Name: 'HH232' }))).toBe('232');
        expect(extractBillNumber('SB101', bill({ Description: 'HH232' }))).toBe('101');
        expect(extractBillNumber('bad', bill({ Name: 'sr242', Description: 'HH232' }))).toBe('242');
        expect(extractBillNumber('bad', bill({ Name: 'worse', Description: 'worst' }))).toBe(undefined);
    });

    it("summarizeSponsors", () => {
        expect(summarizeSponsors(bill())).toBe('');
        expect(summarizeSponsors(bill({ Sponsors: [{ Name: 'bill' } as Sponsor, { Name: 'ted' } as Sponsor] }))).toBe('bill, ted');
    });


});
