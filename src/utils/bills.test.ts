/**
 *  bills.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { deriveDocumentLink, extractBillNumber, inferChamber, summarizeSponsors } from "./bills";
import { LegislativeDocument } from "../api/bill";

describe("bills", () => {

    it("deriveDocumentLink", () => {
        expect(deriveDocumentLink({ Id: 'test' } as LegislativeDocument))
            .toStrictEqual({ "label": "", "url": undefined });
        expect(deriveDocumentLink({ Id: 'test', Description: 'BILL', Url: 'EARL' } as LegislativeDocument))
            .toStrictEqual({ "label": "BILL", "url": "EARL" });
    });

    it("inferChamber", () => {
        expect(inferChamber({ Id: 'test' } as LegislativeDocument)).toBe("Unknown");
        expect(inferChamber({ Id: 'test', Chamber: 'HOUSE' } as LegislativeDocument)).toBe("House");
        expect(inferChamber({ Id: 'test', Chamber: 'Joint' } as LegislativeDocument)).toBe("Joint");

        expect(inferChamber({ Id: 'test', OriginatingAgency: 'House' } as LegislativeDocument)).toBe("House");
        expect(inferChamber({ Id: 'test', Name: 'SB101' } as LegislativeDocument)).toBe("Senate");
    });

    it("extractBillNumber", () => {
        expect(extractBillNumber()).toBe(undefined);
        expect(extractBillNumber('SB101')).toBe('101');
        expect(extractBillNumber(null, { Id: 'test' } as LegislativeDocument)).toBe(undefined);
        expect(extractBillNumber(null, { Id: 'test', Name: 'HH232' } as LegislativeDocument)).toBe('232');
        expect(extractBillNumber('SB101', { Id: 'test', Description: 'HH232' } as LegislativeDocument)).toBe('101');
        expect(extractBillNumber('bad', { Id: 'test', Name: 'sr242', Description: 'HH232' } as LegislativeDocument)).toBe('242');
        expect(extractBillNumber('bad', { Id: 'test', Name: 'worse', Description: 'worst' } as LegislativeDocument)).toBe(undefined);
    });

    it("summarizeSponsors", () => {
        expect(summarizeSponsors({ Id: 'test' } as LegislativeDocument)).toBe('');
        expect(summarizeSponsors({ Id: 'test', Sponsors: [{ Name: 'bill' } as Member, { Name: 'ted' } as Member] } as LegislativeDocument)).toBe('bill, ted');
    });


});