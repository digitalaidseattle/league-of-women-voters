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
      .then(resp => {
        setBills(resp);
        setLoaded(true);
      })
      .catch(async err => {
        if (err.message === 'Bill sponsors not loaded.') {
          await sleep(3000);
          fetchData();
        }
      })
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.sponsored_bills_label} />
      <Grid container sx={{ margin: 2 }}>
        {loaded && bills.map((bill, idx) => {
          return (
            <Grid key={idx} size={6}>
              {/* <Link href={`/bill?number=${bill.Name}&name=${bill.Name}`}>{bill.Name}</Link> */}
              <Link href={`/bill/${bill.Id}`}>{bill.Id}</Link>
            </Grid>
          )
        })}
      </Grid>
    </Card >
  )
};

