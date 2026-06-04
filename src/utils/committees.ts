import { Bill, LegislationInfo } from "../api/bill";
import { Committee } from "../api/committee";

export type CommitteeBillRow = {
  id: string;
  bill: string;
  originalSponsor: string;
  title: string;
  status: string;
  history: string;
  billPageId?: string;
  billSearchUrl: string;
};

export function formatCommitteeName(committee: Committee) {
  return committee.LongName || committee.Name;
}

export function getCommitteePageTitle(committee: Committee) {
  const shortName = committee.Name.replace(/\s*Committee$/i, "");
  return `${committee.Agency} Committee Legislation: ${shortName}`;
}

export function getLeadershipName(committee: Committee, role: string) {
  const leadership = committee.Leadership ?? [];
  const found = leadership.find((leader) => {
    const normalizedRole = leader.role.toLowerCase();

    if (role === "chair") {
      return normalizedRole.includes("chair") &&
        !normalizedRole.includes("vice") &&
        !normalizedRole.includes("minority") &&
        !normalizedRole.includes("majority");
    }

    if (role === "vice") {
      return normalizedRole.includes("vice");
    }

    if (role === "ranking") {
      return normalizedRole.includes("ranking") &&
        !normalizedRole.includes("assistant");
    }

    if (role === "majority") {
      return normalizedRole.includes("majority");
    }

    return false;
  });
  return formatPersonName(found?.name ?? "");
}

export function mapCommitteeBillRow(
  legislation: LegislationInfo,
  bills: Bill[]
): CommitteeBillRow {
  const bill = findBill(legislation, bills);

  return {
    id: legislation.BillId,
    bill: bill?.BillId ?? legislation.BillId,
    originalSponsor: formatSponsor(bill),
    title: bill?.LegalTitle ?? bill?.LongDescription ?? bill?.ShortDescription ?? "",
    status: bill?.CurrentStatus?.Status ?? "",
    history: formatHistory(bill),
    billPageId: bill?.BillId,
    billSearchUrl: getBillSearchUrl(bill, legislation)
  };
}

function formatPersonName(name: string) {
  const [lastName, firstName] = name.split(",").map((part) => part.trim());
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return name;
}

function findBill(legislation: LegislationInfo, bills: Bill[]) {
  const normalizedBillId = normalizeBillId(legislation.BillId);
  return bills.find((bill) =>
    normalizeBillId(bill.BillId) === normalizedBillId ||
    String(bill.BillNumber) === String(legislation.BillNumber)
  );
}

function normalizeBillId(value: string | number | undefined) {
  return String(value ?? "").replace(/\s+/g, "").toUpperCase();
}

function formatSponsor(bill?: Bill) {
  const sponsor = bill?.Sponsors?.[0];
  if (sponsor) {
    return sponsor.Name || `${sponsor.FirstName ?? ""} ${sponsor.LastName ?? ""}`.trim();
  }
  return bill?.Sponsor ?? "";
}

function formatHistory(bill?: Bill) {
  if (!bill?.CurrentStatus) {
    return "";
  }
  const date = formatDate(bill.CurrentStatus.ActionDate);
  return [date, bill.CurrentStatus.HistoryLine].filter(Boolean).join(" ");
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

function getBillSearchUrl(bill: Bill | undefined, legislation: LegislationInfo) {
  const biennium = bill?.Biennium ?? legislation.Biennium;
  const year = biennium?.split("-")[0] ?? "";
  const billNumber = bill?.BillNumber ?? legislation.BillNumber;
  return `https://app.leg.wa.gov/billsummary/?BillNumber=${billNumber}&Year=${year}`;
}
