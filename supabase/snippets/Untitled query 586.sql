SELECT id, 
       agency AS "bill.OriginalAgency"
FROM Bills 
FOR JSONB PATH limit 100