ALTER TABLE
    public."Bills"
ADD
    "OriginalAgency" text;

ALTER TABLE
    public."Bills"
ADD
    "PrimeSponsorID" text;

ALTER TABLE
    public."Bills"
ADD
    "SearchKey" text;

ALTER TABLE
    public."Bills"
ADD
    "CommitteeName" text;

ALTER TABLE
    public."Bills"
ADD
    detail_update timestamp without time zone null;

ALTER TABLE
    public."Bills"
ADD
    info_update timestamp without time zone null;

ALTER TABLE
    public."Bills"
ADD
    committee_update timestamp without time zone null;

ALTER TABLE
    public."Bills"
ADD
    sponsors_update timestamp without time zone null;

ALTER TABLE
    public."Bills"
ADD
    hearings_update timestamp without time zone null;