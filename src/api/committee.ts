import { LegislationInfo } from "./bill";

export type Committee = {
  Acronym: string;
  Agency: string;
  Id: number;
  LongName: string;
  Name: string;
  Phone: string;
  Members: Member[];
  Leadership: { role: string, name: string }[];
  Referrals?: CommitteeReferral[];
  InCommittee?: LegislationInfo[];
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

/* from WA Leg
<CommitteeReferral>
  <LegislationInfo>
    <Biennium>string</Biennium>
    <BillId>string</BillId>
    <BillNumber>int</BillNumber>
    <SubstituteVersion>int</SubstituteVersion>
    <EngrossedVersion>int</EngrossedVersion>
    <ShortLegislationType xsi:nil="true" />
    <OriginalAgency>string</OriginalAgency>
    <Active>boolean</Active>
    <DisplayNumber>string</DisplayNumber>
  </LegislationInfo>
  <Committee>
    <Phone>string</Phone>
  </Committee>
  <ReferredDate>dateTime</ReferredDate>
</CommitteeReferral>    
 */

export type CommitteeReferral = {
  LegislationInfo: LegislationInfo;
  CommitteePhone: string;
  ReferredDate: string;
}
