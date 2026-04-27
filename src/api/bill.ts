type DocumentHistoryLine = {
  ActionDate?: string;
  HistoryDate?: string;
  Date?: string;
  Text?: string;
  Description?: string;
  HistoryText?: string;
};

type LegislativeDocument = {
  Id: string;
  Name?: string;
  Biennium?: string;
  Description?: string;
  ShortDescription?: string;
  LongTitle?: string;
  Title?: string;
  Status?: string;
  CurrentStatus?: string;
  DocumentType?: string;
  DocumentTypeDescription?: string;
  DocumentTypeAbbreviation?: string;
  Url?: string;
  Hyperlink?: string;
  SourceUrl?: string;
  CommitteeName?: string;
  CommitteeNames?: {
    CommitteeName?: string | string[];
  };
  Sponsors?: Sponsor[];
  OriginatingAgency?: string;
  Agency?: string;
  Chamber?: string;
  StatusDate?: string;
  CurrentStatusDate?: string;
  LastModified?: string;
  DocumentHistory?: {
    DocumentHistoryLine?:
    | DocumentHistoryLine
    | DocumentHistoryLine[]
    | null;
  };
  PrimeSponsorID?: number;
  [key: string]: unknown;
};

type BillRow = {
  id: string;
  billNumber: string;
  normalizedBillNumber: string;
  committee: string;
  title: string;
  status: string;
  history: string;
  latestDocumentLabel: string;
  latestDocumentUrl?: string;
  chamber: 'House' | 'Senate' | 'Joint' | 'Unknown';
  raw: LegislativeDocument;
};

export type { DocumentHistoryLine, LegislativeDocument, BillRow };
