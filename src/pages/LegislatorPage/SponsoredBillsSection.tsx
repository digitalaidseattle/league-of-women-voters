/**
 *  SponsoredBillsSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardHeader, Grid, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { Bill } from '../../api/bill';
import { BillService } from '../../api/billService';
import { sleep } from '../../utils/sleep';
import { LEGISLATORS_CONSTANTS } from './constants';
import { NavLink } from 'react-router-dom';

export function SponsoredBillsSection({ legislator }: { legislator: Member }) {
  const [bills, setBills] = useState<Bill[]>([]);
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
  function collapseBills(bills: Bill[]): Bill[] {
    const map = new Map<string, Bill>();
    bills.forEach(bill => {
      const billNumber = bill.BillNumber;
      map.set(billNumber, bill);
    });
    return [...map.values()].sort((b1, b2) => ("" + b1.BillId).localeCompare("" + b2.BillId));
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
              <NavLink
                title={`Open ${bill.BillId}`}
                to={`/bill/${bill.BillId}`}>{getBillNumber(bill.BillId)}</NavLink>
            </Grid>
          )
        })}
      </Grid>
    </Card >
  )
};


