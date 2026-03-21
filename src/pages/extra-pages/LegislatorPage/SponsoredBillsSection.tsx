/**
 *  SponsoredBillsSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardHeader, Grid, Link } from '@mui/material';
import { LEGISLATORS_CONSTANTS } from './constants';
import { LegislativeDocument } from '../../../api/bill';
import { useEffect, useState } from 'react';
import { BillService } from '../../../api/billService';

export function SponsoredBillsSection({ legislator }: { legislator: Member }) {
  const [bills, setBills] = useState<LegislativeDocument[]>([]);

  useEffect(() => {
    if (legislator) {
      fetchData();
    }
  }, [legislator])

  async function fetchData() {
    return BillService.getInstance()
      .findBillsBySponsor(legislator)
      .then(resp => setBills(resp));
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.sponsored_bills_label} />
      <Grid container sx={{ margin: 2 }}>
        {bills.map((bill, idx) => {
          return (
            <Grid key={idx} size={6}>
              <Link href={`/bill?number=${bill.Name}&name=${bill.Name}`}>{bill.Name}</Link>
            </Grid>
          )
        })}
      </Grid>
    </Card >
  )
};

