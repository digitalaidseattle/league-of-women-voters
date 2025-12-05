/**
 *  bills.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { LegislativeDocument } from "../api/bill";
import { deriveDocumentLink, extractBillNumber, inferChamber, summarizeSponsors } from "./bills";

describe("bills", () => {

    it("deriveDocumentLink", () => {
        expect(deriveDocumentLink({}))
            .toStrictEqual({ "label": "", "url": undefined });
        expect(deriveDocumentLink({ Description: 'BILL', Url: 'EARL' }))
            .toStrictEqual({ "label": "BILL", "url": "EARL" });
    });

    it("inferChamber", () => {
        expect(inferChamber({})).toBe("Unknown");
        expect(inferChamber({ Chamber: 'HOUSE' })).toBe("House");
        expect(inferChamber({ Chamber: 'Joint' })).toBe("Joint");

        expect(inferChamber({ OriginatingAgency: 'House' })).toBe("House");
        expect(inferChamber({ Name: 'SB101' })).toBe("Senate");
    });

    it("extractBillNumber", () => {
        expect(extractBillNumber()).toBe(undefined);
        expect(extractBillNumber('SB101')).toBe('101');
        expect(extractBillNumber(null, {})).toBe(undefined);
        expect(extractBillNumber(null, { Name: 'HH232' })).toBe('232');
        expect(extractBillNumber('SB101', { Description: 'HH232' })).toBe('101');
        expect(extractBillNumber('bad', { Name: 'sr242', Description: 'HH232' })).toBe('242');
        expect(extractBillNumber('bad', { Name: 'worse', Description: 'worst' })).toBe(undefined);
    });

    it("summarizeSponsors", () => {
        expect(summarizeSponsors({})).toBe('');
        expect(summarizeSponsors({ Sponsors: 'bill' })).toBe('bill');
        expect(summarizeSponsors({ Sponsors: ['bill', 'ted'] })).toBe('bill, ted');
    });


});