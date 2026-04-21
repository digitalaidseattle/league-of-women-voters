import type {
  BillRow,
  DocumentHistoryLine,
  LegislativeDocument
} from "../api/bill";

type BillFilterOptions = {
  tab: string;
  query: string;
};

class BillsService {
  static mapLegislativeDocumentToBillRow(
    bill: LegislativeDocument,
  ): BillRow | undefined {
    const billIdentifier = BillsService.stringFallback([bill.Name]);
    const fallbackIdentifier = BillsService.stringFallback([
      bill.Title,
      bill.ShortDescription,
      bill.Description
    ]);
    const billNumber = billIdentifier || fallbackIdentifier;
    const normalizedBillNumber =
      BillsService.extractBillNumber(billIdentifier ?? fallbackIdentifier, bill) ?? "";

    if (!billNumber) {
      return undefined;
    }

    const chamber = BillsService.inferChamber(bill);
    const committee = BillsService.deriveCommittee(bill);
    const title = BillsService.stringFallback([
      bill.Title,
      bill.LongTitle,
      bill.Description,
      bill.ShortDescription
    ]);
    const historyLine = BillsService.latestHistoryLine(bill);
    const status = BillsService.stringFallback([
      bill.Status,
      bill.CurrentStatus,
      historyLine?.Text,
      historyLine?.Description,
      historyLine?.HistoryText
    ]);
    const history = BillsService.formatHistory(historyLine);
    const { label: latestDocumentLabel, url: latestDocumentUrl } =
      BillsService.deriveDocumentLink(bill);

    console.log(bill)
    return {
      id: bill.Name!, //[billNumber, bill.Biennium ?? index].join("-"),
      billNumber: BillsService.displayValue(billNumber),
      normalizedBillNumber,
      committee: BillsService.displayValue(committee),
      title: BillsService.displayValue(title),
      status: BillsService.displayValue(status),
      history: BillsService.displayValue(history),
      latestDocumentLabel: BillsService.displayValue(latestDocumentLabel),
      latestDocumentUrl,
      chamber,
      raw: bill
    };
  }

  static buildFilterPredicate({ tab, query }: BillFilterOptions) {
    const loweredQuery = query.trim().toLowerCase();
    return (row: BillRow) => {
      const matchesTab = tab === "all" ? true : row.chamber.toLowerCase() === tab;
      if (!matchesTab) {
        return false;
      }
      if (!loweredQuery) {
        return true;
      }
      const haystack = [
        row.billNumber,
        row.title,
        row.committee,
        row.status,
        row.history,
        row.latestDocumentLabel
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(loweredQuery);
    };
  }

  static sanitizeBillUrl(url: string, bill?: LegislativeDocument): string {
    if (!url) {
      return "";
    }

    try {
      const parsed = new URL(url);
      const original = parsed.searchParams.get("BillNumber");
      const replacement = BillsService.extractBillNumber(original, bill);
      if (replacement && replacement !== original) {
        parsed.searchParams.set("BillNumber", replacement);
        return parsed.toString();
      }
      return url;
    } catch (_error) {
      const replacement = BillsService.extractBillNumber(undefined, bill);
      if (!replacement) {
        return url;
      }
      return url.replace(/BillNumber=[^&]+/, `BillNumber=${replacement}`);
    }
  }

  static extractBillNumber(
    candidate?: string | null,
    bill?: LegislativeDocument
  ): string | undefined {
    const possibilities: Array<string | undefined | null> = [
      candidate,
      bill?.Name,
      bill?.Title,
      bill?.Description
    ];

    for (const value of possibilities) {
      if (typeof value !== "string") {
        continue;
      }
      const digitsOnly = value.replace(/\D+/g, "");
      if (digitsOnly.length > 0) {
        return digitsOnly;
      }
    }
    return undefined;
  }

  static summarizeSponsors(bill: LegislativeDocument): string {
    const sponsorField = bill?.Sponsors;
    if (!sponsorField) {
      return "";
    }
    if (typeof sponsorField === "string") {
      return sponsorField;
    }
    return Array.isArray(sponsorField) ? sponsorField.join(", ") : "";
  }

  private static stringFallback(candidates: Array<string | undefined | null>) {
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
    return "";
  }

  private static deriveCommittee(bill: LegislativeDocument) {
    const committeeCandidate = BillsService.stringFallback([
      Array.isArray(bill.CommitteeNames?.CommitteeName)
        ? bill.CommitteeNames?.CommitteeName?.[0]
        : typeof bill.CommitteeNames?.CommitteeName === "string"
          ? bill.CommitteeNames.CommitteeName
          : undefined,
      bill.CommitteeName,
      bill.OriginatingAgency,
      bill.Agency
    ]);

    return committeeCandidate;
  }

  static inferChamber(bill: LegislativeDocument): BillRow["chamber"] {
    const textual = [
      bill.Chamber,
      bill.OriginatingAgency,
      bill.Agency
    ]
      .map((value) =>
        typeof value === "string" ? value.toLowerCase() : undefined
      )
      .filter(Boolean) as string[];

    if (textual.some((value) => value.includes("joint"))) {
      return "Joint";
    }
    if (textual.some((value) => value.includes("house"))) {
      return "House";
    }
    if (textual.some((value) => value.includes("senate"))) {
      return "Senate";
    }

    const name = (bill.Name ?? "").toUpperCase();
    if (name.startsWith("HB")) {
      return "House";
    }
    if (["HJR", "HJM", "HCR"].some((prefix) => name.startsWith(prefix))) {
      return "Joint";
    }

    if (name.startsWith("SB")) {
      return "Senate";
    }
    if (["SJR", "SJM", "SCR"].some((prefix) => name.startsWith(prefix))) {
      return "Joint";
    }
    return "Unknown";
  }

  private static latestHistoryLine(
    bill: LegislativeDocument
  ): DocumentHistoryLine | undefined {
    const historyNode = bill.DocumentHistory?.DocumentHistoryLine;
    if (!historyNode) {
      return undefined;
    }
    if (Array.isArray(historyNode)) {
      return historyNode[0];
    }
    return historyNode;
  }

  private static formatHistory(
    historyLine: ReturnType<typeof BillsService.latestHistoryLine>
  ) {
    if (!historyLine) {
      return "";
    }
    const possibleDate =
      historyLine.ActionDate ??
      historyLine.Date ??
      historyLine.HistoryDate;
    const possibleText =
      historyLine.Text ??
      historyLine.Description ??
      historyLine.HistoryText;

    const formattedDate = BillsService.formatDate(possibleDate);

    return [formattedDate, possibleText].filter(Boolean).join(" ");
  }

  private static formatDate(raw?: string) {
    if (!raw) {
      return "";
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return raw;
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  static deriveDocumentLink(bill: LegislativeDocument) {
    const url =
      bill.Url ??
      bill.Hyperlink ??
      bill.SourceUrl ??
      "";
    const sanitizedUrl = BillsService.sanitizeBillUrl(url, bill);
    const label = sanitizedUrl ? "View document" : "";

    return {
      label,
      url: sanitizedUrl || undefined
    };
  }

  private static displayValue(value: string) {
    return value && value.trim().length > 0 ? value : "—";
  }
}

const deriveDocumentLink = (bill: LegislativeDocument) =>
  BillsService.deriveDocumentLink(bill);
const extractBillNumber = (
  candidate?: string | null,
  bill?: LegislativeDocument
) => BillsService.extractBillNumber(candidate, bill);
const inferChamber = (bill: LegislativeDocument) =>
  BillsService.inferChamber(bill);
const summarizeSponsors = (bill: LegislativeDocument) =>
  BillsService.summarizeSponsors(bill);

export {
  BillsService,
  deriveDocumentLink,
  extractBillNumber,
  inferChamber,
  summarizeSponsors
};
