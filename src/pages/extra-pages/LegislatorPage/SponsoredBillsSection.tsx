/**
 *  SponsoredBillsSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardHeader, Grid, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { LegislativeDocument } from '../../../api/bill';
import { BillService } from '../../../api/billService';
import { sleep } from '../../../utils/sleep';
import { LEGISLATORS_CONSTANTS } from './constants';

export function SponsoredBillsSection({ legislator }: { legislator: Member }) {
  const [bills, setBills] = useState<LegislativeDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (legislator) {
      fetchData();
    }
  }, [legislator])

  async function fetchData() {
    return BillService.getInstance()
      .findBillsBySponsor(legislator)
      .then(bills => {
        const col = collapseBills(bills)
        setBills(col);
        setLoaded(true);
      })
      .catch(async err => {
        if (err.message === 'Bill sponsors not loaded.') {
          await sleep(3000);
          fetchData();
        }
      })
  }

  // The same bill will have different IDs (e.g. 1007, 1007.SP, etc.)
  function collapseBills(bills: LegislativeDocument[]): LegislativeDocument[] {
    const map = new Map<string, LegislativeDocument>();
    bills.forEach(bill => {
      const billNumber = getBillNumber(bill.Id);
      map.set(billNumber, bill);
    });
    return [...map.values()].sort((b1, b2) => ("" + b1.Id).localeCompare("" + b2.Id));
  }

  function getBillNumber(billId: string): string {
    const noPeriod = ("" + billId).split('.')[0];
    const noDash = noPeriod.split('-')[0];
    return noDash;
  }


  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.sponsored_bills_label} />
      <Grid container sx={{ margin: 2 }}>
        {loaded && bills.map((bill, idx) => {
          return (
            <Grid key={idx} size={6}>
              {/* <Link href={`/bill?number=${bill.Name}&name=${bill.Name}`}>{bill.Name}</Link> */}
              <Link href={`/bill/${bill.Id}`}>{getBillNumber(bill.Id)}</Link>
            </Grid>
          )
        })}
      </Grid>
    </Card >
  )
};


