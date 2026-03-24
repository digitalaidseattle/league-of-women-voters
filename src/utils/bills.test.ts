/**
 *  bills.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { deriveDocumentLink, extractBillNumber, inferChamber, summarizeSponsors } from "./bills";

describe("bills", () => {

    it("deriveDocumentLink", () => {
        expect(deriveDocumentLink({ Id: 'test', BillId: 'test' }))
            .toStrictEqual({ "label": "", "url": undefined });
        expect(deriveDocumentLink({ Id: 'test', BillId: 'test', Description: 'BILL', Url: 'EARL' }))
            .toStrictEqual({ "label": "BILL", "url": "EARL" });
    });

    it("inferChamber", () => {
        expect(inferChamber({ Id: 'test', BillId: 'test' })).toBe("Unknown");
        expect(inferChamber({ Id: 'test', BillId: 'test', Chamber: 'HOUSE' })).toBe("House");
        expect(inferChamber({ Id: 'test', BillId: 'test', Chamber: 'Joint' })).toBe("Joint");

        expect(inferChamber({ Id: 'test', BillId: 'test', OriginatingAgency: 'House' })).toBe("House");
        expect(inferChamber({ Id: 'test', BillId: 'test', Name: 'SB101' })).toBe("Senate");
    });

    it("extractBillNumber", () => {
        expect(extractBillNumber()).toBe(undefined);
        expect(extractBillNumber('SB101')).toBe('101');
        expect(extractBillNumber(null, { Id: 'test', BillId: 'test' })).toBe(undefined);
        expect(extractBillNumber(null, { Id: 'test', BillId: 'test', Name: 'HH232' })).toBe('232');
        expect(extractBillNumber('SB101', { Id: 'test', BillId: 'test', Description: 'HH232' })).toBe('101');
        expect(extractBillNumber('bad', { Id: 'test', BillId: 'test', Name: 'sr242', Description: 'HH232' })).toBe('242');
        expect(extractBillNumber('bad', { Id: 'test', BillId: 'test', Name: 'worse', Description: 'worst' })).toBe(undefined);
    });

    it("summarizeSponsors", () => {
        expect(summarizeSponsors({ Id: 'test', BillId: 'test' })).toBe('');
        expect(summarizeSponsors({ Id: 'test', BillId: 'test', Sponsors: [{ Name: 'bill' } as Sponsor, { Name: 'ted' } as Sponsor] })).toBe('bill, ted');
    });


});