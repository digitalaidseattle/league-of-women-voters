import type {
  BillRow,
  DocumentHistoryLine,
  LegislativeDocument
} from "../api/bill";

function mapLegislativeDocumentToBillRow(
  bill: LegislativeDocument,
  index: number
): BillRow | undefined {
  const billIdentifier = stringFallback([bill.Name]);
  const fallbackIdentifier = stringFallback([
    bill.Title,
    bill.ShortDescription,
    bill.Description
  ]);
  const billNumber = billIdentifier || fallbackIdentifier;
  const normalizedBillNumber = extractBillNumber(billIdentifier ?? fallbackIdentifier, bill) ?? "";

  if (!billNumber) {
    return undefined;
  }

  const chamber = inferChamber(bill);
  const committee = deriveCommittee(bill);
  const title = stringFallback([
    bill.Title,
    bill.LongTitle,
    bill.Description,
    bill.ShortDescription
  ]);
  const historyLine = latestHistoryLine(bill);
  const status = stringFallback([
    bill.Status,
    bill.CurrentStatus,
    historyLine?.Text,
    historyLine?.Description,
    historyLine?.HistoryText
  ]);
  const history = formatHistory(historyLine);
  const { label: latestDocumentLabel, url: latestDocumentUrl } =
    deriveDocumentLink(bill);

  return {
    id: [billNumber, bill.Biennium ?? index].join("-"),
    billNumber: displayValue(billNumber),
    normalizedBillNumber,
    committee: displayValue(committee),
    title: displayValue(title),
    status: displayValue(status),
    history: displayValue(history),
    latestDocumentLabel: displayValue(latestDocumentLabel),
    latestDocumentUrl,
    chamber,
    raw: bill
  };
}

function sanitizeBillUrl(
  url: string,
  bill?: LegislativeDocument
): string {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const original = parsed.searchParams.get("BillNumber");
    const replacement = extractBillNumber(original, bill);
    if (replacement && replacement !== original) {
      parsed.searchParams.set("BillNumber", replacement);
      return parsed.toString();
    }
    return url;
  } catch (_error) {
    const replacement = extractBillNumber(undefined, bill);
    if (!replacement) {
      return url;
    }
    return url.replace(/BillNumber=[^&]+/, `BillNumber=${replacement}`);
  }
}

function extractBillNumber(
  candidate?: string | null,
  bill?: LegislativeDocument
): string | undefined {
  const possibilities: Array<string | undefined | null> = [
    candidate,
    bill?.Name,
    bill?.Title,
    bill?.Description
  ];

  return possibilities
    .filter(poss => poss)
    .map(poss => String(poss).replace(/\D+/g, ""))
    .find(poss => poss.length > 0)

  // for (const value of possibilities) {
  //   if (typeof value !== "string") {
  //     continue;
  //   }
  //   const digitsOnly = value.replace(/\D+/g, "");
  //   if (digitsOnly.length > 0) {
  //     return digitsOnly;
  //   }
  // }
  // return undefined;
}

function stringFallback(candidates: Array<string | undefined | null>) {
  const found = candidates
    .find(candidate => typeof candidate === "string" && candidate.trim().length > 0);
  return found ? found.trim() : "";

  // for (const candidate of candidates) {
  //   if (typeof candidate === "string" && candidate.trim().length > 0) {
  //     return candidate.trim();
  //   }
  // }
  // return "";
}

function deriveCommittee(bill: LegislativeDocument) {
  const committeeCandidate = stringFallback([
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

function inferChamber(bill: LegislativeDocument): BillRow["chamber"] {

  const name = (bill.BillId as string ?? "").toUpperCase();

  if (name.startsWith("HB")) {
    return "House";
  }
  if (["HJR", "HJM", "HCR"].some((prefix) => name.startsWith(prefix))) {
    return "Joint";
  }

  if (["ESSB", "SSB", "SB", "2SSB", "E2SSB"].some((prefix) => name.startsWith(prefix))) {
    return "Senate";
  }
  if (["SJR", "SJM", "SCR"].some((prefix) => name.startsWith(prefix))) {
    return "Joint";
  }
  return "Unknown";
}

function latestHistoryLine(
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

function formatHistory(historyLine: ReturnType<typeof latestHistoryLine>) {
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

  const formattedDate = formatDate(possibleDate);

  return [formattedDate, possibleText].filter(Boolean).join(" ");
}

function formatDate(raw?: string) {
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

function deriveDocumentLink(bill: LegislativeDocument) {
  const url =
    bill.Url ??
    bill.Hyperlink ??
    bill.SourceUrl ??
    "";
  const sanitizedUrl = sanitizeBillUrl(url, bill);

  return {
    label: "View document",
    url: sanitizedUrl || undefined
  };
}

function displayValue(value: string) {
  return value && value.trim().length > 0 ? value : "—";
}

function summarizeSponsors(bill: LegislativeDocument): string {
  return (bill.Sponsors ?? [])
    ?.map(sponsor => sponsor.Name)
    .join(',');
}

export {
  mapLegislativeDocumentToBillRow,
  sanitizeBillUrl,
  deriveDocumentLink,
  inferChamber,
  summarizeSponsors,
  extractBillNumber
};