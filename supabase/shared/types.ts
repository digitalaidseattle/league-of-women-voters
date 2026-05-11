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
