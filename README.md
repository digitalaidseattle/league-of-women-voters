# League of Wommen Voter of Washington

## Data caching

Requirements dictate that data be assembled from various sources.   Gathering the information incur the following difficulties:
1. The information needs to be mapped to a schema more aligned with LWVW needs
2. Data not available in application-friendly forms

To make the information accessible to LWVW users required caching the data requests into a database that is readily available.  Caching is accomplished by doing the following:
1. Creating edge function that will retrieve data via various APIs
2. Using AI to scrape data thta is not available via the APIs

To mitigate retrieval errors and limiting AI usage rates, a retry mechanism is put in place to progressively update records.

## Setup for local development 

1. Install Docker & Supabase CLI
2. Initialize Supabase
3. Start local Supabase ```supabase start```
4. Initialize/migrate Postgres ```supabase migrations```
5. Start Supabase edge functions ```supabase functions serve```
6. Confirm installation ```[Local Supabase studio](http://localhost:54323/project)


