import { Identifier } from "npm:@digitalaidseattle/core";

export type Committee = {
  Acronym: string;
  Agency: string;
  Id: number;
  LongName: string;
  Name: string;
  Phone: string;
  Members: Member[];
  Leadership: { role: string, name: string }[]
};

export type Member = {
  Id: number;
  Name: string;
  LongName: string;
  Agency: string;
  Acronym: string;
  Party: string;
  District: string;
  Phone: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Address?: string;
  LegislativeAssistant?: { name: string, phone: string }[];
};

export type DBSponsor = {
  id: Identifier,
  created_at: Date,
  updated_at: Date,
  info_update: Date,
  sponsor: Member
}

export type DBCommittee = {
  id: Identifier,
  created_at: Date,
  updated_at: Date,
  membership_update: Date,
  leadership_update: Date,
  committee: Committee
}

export type DBBill = {
  id: Identifier;
  created_at: Date;
  updated_at: Date;
  detail_update: Date;
  committee_update: Date;
  bill: Bill;
  OriginalAgency?: string;
  PrimeSponsorID?: number;
  SearchKey?: number;
  CommitteeName: string;
}

export type LegislationInfo = {
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

export type Legislation = {
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

export type Bill = LegislationInfo & Legislation & { InCommittee: Committee | null }