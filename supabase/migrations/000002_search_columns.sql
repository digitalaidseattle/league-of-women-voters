ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "OriginalAgency" TEXT;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "PrimeSponsorID" integer;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "SearchKey" TEXT;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "CommitteeName" TEXT;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "info_update" without time zone null;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "committee_update" without time zone null;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "sponsors_update" without time zone null;
ALTER TABLE Bills ADD COLUMN IF NOT EXISTS "hearings_date" without time zone null;


ALTER TABLE Committees ADD COLUMN IF NOT EXISTS "Agency" TEXT;
ALTER TABLE Committees ADD COLUMN IF NOT EXISTS "referral_update" without time zone null;
ALTER TABLE Committees ADD COLUMN IF NOT EXISTS "incommittee_update" without time zone null;

ALTER TABLE Sponsors ADD COLUMN IF NOT EXISTS "OriginalAgency" TEXT;
