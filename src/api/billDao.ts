/**
 *  BillDao.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { SupabaseClient } from '@supabase/supabase-js';
import type { LegislativeDocument } from "./bill";
import { getConfiguration } from './configuration';

const DEFAULT_DOCUMENT_CLASS = "Bills";

export class BillDao {
  private static instance: BillDao;

  public static getInstance(): BillDao {
    if (!BillDao.instance) {
      BillDao.instance = new BillDao();
    }
    return BillDao.instance;
  }

  client: SupabaseClient;
  biennium: string;

  private constructor() {
    const current = import.meta.env.VITE_LWVW_CURRENT_BIENNIUM;
    if (current) {
      this.biennium = current;
    } else {
      throw new Error("VITE_LWVW_CURRENT_BIENNIUM is required, but was not provided.");
    }

    this.client = getConfiguration().client;
  }

  public async getBills(documentClass?: string): Promise<LegislativeDocument[]> {
    const docClass = documentClass ?? DEFAULT_DOCUMENT_CLASS;
    return this.client.functions
      .invoke("bills-services", {
        body: { biennium: this.biennium, documentClass: docClass },
      })
      .then((resp: any) => {
        if (resp.error) {
          throw resp.error
        }
        return resp.data
      });
  }

  /**
  Active: true
  Appropriations: false
  Biennium: "2025-26"
  BillId: "HB 1000"
  BillNumber: 1000
  Companions: ""
  CurrentStatus: {BillId: 'HB 1000', HistoryLine: 'By resolution, reintroduced and retained in present status.', ActionDate: '2026-01-12T00:00:00', AmendedByOppositeBody: false, PartialVeto: false, …}
  EngrossedVersion: 0
  IntroducedDate: "2025-01-13T00:00:00"
  LegalTitle: "AN ACT Relating to expanding the circumstances that may constitute a major violation of the uniform controlled substances act;"
  LocalFiscalNote: false
  LongDescription: "Expanding the circumstances that may constitute a major violation of the uniform controlled substances act."
  OriginalAgency: "House"
  PrimeSponsorID: 27181
  Request: "H-0097.1"
  RequestedByBudgetCommittee: false
  RequestedByDepartment: false
  RequestedByGovernor: false
  RequestedByOther: false
  ShortDescription: "Controlled subst. violations"
  ShortLegislationType: {ShortLegislationType: 'B', LongLegislationType: 'Bill'}
  Sponsor: "(Walsh)"
  StateFiscalNote: false
  SubstituteVersion: 0
  */
  public async getBillDetails(billNumber: string): Promise<any> {
    const noPeriod = `${billNumber}`.split('.')[0];
    const noDash = `${noPeriod}`.split('-')[0];
    const { error, data } = await this.client.functions
      .invoke("legislation-services", {
        body: { operation: "GetLegislation", biennium: this.biennium, billNumber: noDash }
      })
    if (error) {
      throw error;
    }
    return data;
  }

  public async getBillSponsors(billNumber: string): Promise<Sponsor[]> {
    const { error, data } = await this.client.functions
      .invoke("legislation-services", {
        body: { operation: "GetSponsors", biennium: this.biennium, billNumber: billNumber }
      })
    if (error) {
      throw error;
    }
    return Array.isArray(data) ? data : [data];
  }
}

