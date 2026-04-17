import type { BillRow } from "../api/bill";

/**
 * Maps an OpenStates bill object → BillRow
 */
function mapOpenStatesBillToBillRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bill: any,
): BillRow | undefined {
  if (!bill?.identifier) {
    return undefined;
  }

  const identifier: string = bill.identifier; // "HB 1091"
  const billNumber = identifier.replace(/\D+/g, ""); // "1091"

  const title: string = bill.title ?? "—";

  const latestActionDate = bill.latest_action_date
    ? formatDate(bill.latest_action_date)
    : "";

  const latestActionDescription =
    bill.latest_action_description ?? "";

  const history = [latestActionDate, latestActionDescription]
    .filter(Boolean)
    .join(" ");
    
    // Use from_organization.name as committee
    const committee = bill.from_organization?.name || "";
    
    // Use openstates_url as status
    const status = bill.openstates_url || "";
  return {
    id: identifier, // ✅ REQUIRED
    billNumber: identifier,
    normalizedBillNumber: billNumber,
    committee: committee,
    title,
    status: status,
    history,
    latestDocumentLabel: "View bill",
    latestDocumentUrl: bill.Url,
    chamber: inferChamberFromIdentifier(identifier),
    raw: bill
  };
}

/** Infer chamber from bill prefix */
function inferChamberFromIdentifier(
  identifier: string
): BillRow["chamber"] {
  const upper = identifier.toUpperCase();
  if (upper.startsWith("HB")) return "House";
  if (upper.startsWith("SB")) return "Senate";
  if (["HJR", "SJR", "HJM", "SJM"].some(p => upper.startsWith(p))) {
    return "Joint";
  }
  return "Unknown";
}

function formatDate(raw: string) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export { mapOpenStatesBillToBillRow };