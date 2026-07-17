ALTER TABLE public."Committees" 
ADD "Agency" text;

ALTER TABLE public."Committees" 
ADD incommittee_update timestamp without time zone null;

ALTER TABLE public."Committees" 
ADD referral_update timestamp without time zone null;
