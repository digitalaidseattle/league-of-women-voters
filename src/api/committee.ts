// This is mainly for documentation purposes, as the API is not used directly in the codebase.


type Committee = {
  Acronym: string;
  Agency: string;
  Id: number;
  LongName: string;
  Name: string;
  Phone: string;
};

type Member = {
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
};

type LegislationInfo = {
  Biennium: string;
  BillId: string;
  BillNumber: number;
  SubstituteVersion: number;
  EngrossedVersion: number;
  ShortLegislationType: { Type: string; Description: string };
  OriginalAgency: string;
  Active: boolean;
  DisplayNumber: number;
};

type Referral = {
  legislationInfo: LegislationInfo;
  committee: Committee;
  ReferredDate: string;
};
