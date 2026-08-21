ALTER TABLE public."Preferences" ADD COLUMN bills_new TEXT[];

UPDATE public."Preferences"
SET bills_new = CASE
  WHEN bills IS NULL THEN NULL
  ELSE ARRAY(SELECT jsonb_array_elements_text(bills))
END;

ALTER TABLE public."Preferences" DROP COLUMN bills;
ALTER TABLE public."Preferences" RENAME COLUMN bills_new TO bills;