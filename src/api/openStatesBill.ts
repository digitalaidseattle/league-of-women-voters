export interface LegBill {
  // Custom enriched field
  Url?: string;
  
  // Core bill information
  id: string;
  identifier: string;
  title: string;
  classification: string[];
  subject: string[];
  
  // Dates
  created_at: string;
  updated_at: string;
  first_action_date: string;
  latest_action_date: string;
  latest_action_description: string;
  latest_passage_date: string;
  
  // Session and jurisdiction
  session: string;
  jurisdiction: {
    id: string;
    name: string;
    classification: string;
  };
  
  // Organization
  from_organization: {
    id: string;
    name: string;
    classification: string;
  };
  
  // URLs and extras
  openstates_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extras: Record<string, any>;
}