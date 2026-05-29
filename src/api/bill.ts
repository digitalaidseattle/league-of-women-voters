import { Entity } from "@digitalaidseattle/core";
import { Committee, Member } from "./committee";

type DocumentHistoryLine = {
  ActionDate?: string;
  HistoryDate?: string;
  Date?: string;
  Text?: string;
  Description?: string;
  HistoryText?: string;
};
/* from WA Leg
<LegislationInfo>
  <Biennium>string </Biennium>
  < BillId > string </BillId>
  < BillNumber > int </BillNumber>
  < SubstituteVersion > int </SubstituteVersion>
  < EngrossedVersion > int </EngrossedVersion>
  < ShortLegislationType >
  <ShortLegislationType>string </ShortLegislationType>
  < LongLegislationType > string </LongLegislationType>
  </ShortLegislationType>
  < OriginalAgency > string </OriginalAgency>
  < Active > boolean </Active>
  < DisplayNumber > string </DisplayNumber>
  </LegislationInfo>
*/

type LegislationInfo = {
  Biennium: string;
  BillId: string;
  BillNumber: string;
  SubstituteVersion: number;
  EngrossedVersion: number;
  ShortLegislationType: {
    ShortLegislationType: string;
    LongLegislationType: string;
  }
  OriginalAgency: string;
  Active: boolean;
  DisplayNumber: string;
}
/* From WA Leg
<Legislation>
  <StateFiscalNote>boolean </StateFiscalNote>
  < LocalFiscalNote > boolean </LocalFiscalNote>
  < Appropriations > boolean </Appropriations>
  < RequestedByGovernor > boolean </RequestedByGovernor>
  < RequestedByBudgetCommittee > boolean </RequestedByBudgetCommittee>
  < RequestedByDepartment > boolean </RequestedByDepartment>
  < RequestedByOther > boolean </RequestedByOther>
  < ShortDescription > string </ShortDescription>
  < Request > string </Request>
  < IntroducedDate > dateTime </IntroducedDate>
  < CurrentStatus >
  <BillId>string </BillId>
  < HistoryLine > string </HistoryLine>
  < ActionDate > dateTime </ActionDate>
  < AmendedByOppositeBody > boolean </AmendedByOppositeBody>
  < PartialVeto > boolean </PartialVeto>
  < Veto > boolean </Veto>
  < AmendmentsExist > boolean </AmendmentsExist>
  < Status > string </Status>
  </CurrentStatus>
  < Sponsor > string </Sponsor>
  < PrimeSponsorID > int </PrimeSponsorID>
  < LongDescription > string </LongDescription>
  < LegalTitle > string </LegalTitle>
  < Companions >
  <Companion xsi: nil = "true" />
    <Companion xsi: nil = "true" />
      </Companions>
      </Legislation>
*/

type Legislation = {
  StateFiscalNote: boolean;
  LocalFiscalNote: boolean;
  Appropriations: boolean;
  RequestedByGovernor: boolean;
  RequestedByBudgetCommittee: boolean;
  RequestedByDepartment: boolean;
  RequestedByOther: boolean;
  ShortDescription: string;
  Request: string;
  IntroducedDate: string;
  CurrentStatus: {
    BillId: string;
    HistoryLine: string;
    ActionDate: string;
    AmendedByOppositeBody: boolean;
    PartialVeto: boolean;
    Veto: boolean;
    AmendmentsExist: boolean;
    Status: string;
  };
  Sponsor: string;
  PrimeSponsorID: number;
  LongDescription: string;
  LegalTitle: string;
  Companions?: {
    Companion?: unknown; // not sure what this is, seems to always be null
  }
};

type Bill = Entity & LegislationInfo & Legislation & {
  Sponsors?: Member[];
  InCommittee?: Committee;
};

type LegislativeDocument = {
  Id: string;
  Name?: string;
  BillId: string;
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
  Sponsors?: Member[];
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


export type {
  DocumentHistoryLine,
  Legislation,
  LegislationInfo,
  LegislativeDocument,
  Bill,
  BillRow
};
