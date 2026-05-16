/**
 *  SponsorsSection.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Card, CardHeader, Grid, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bill } from '../../api/bill';
import { BillDao } from '../../api/billDao';
import { BILL_CONSTANTS } from './constants';
import { LoadingContext } from '@digitalaidseattle/core';

export function SponsorsSection({ bill }: { bill: Bill }) {
  const billDao = BillDao.getInstance();
  const [sponsors, setSponsors] = useState<Member[]>([]);
  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
    billDao.getBillSponsors(bill.BillNumber)
      .then(resp => setSponsors(resp.sort((a, b) => {
        if (a.Id === bill.PrimeSponsorID) {
          return -1
        }
        else if (b.Id === bill.PrimeSponsorID) {
          return 1
        } else {
          return a.LastName.localeCompare(b.LastName)
        }
      })))
      .finally(() => setLoading(false))
  }, [bill]);


  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={BILL_CONSTANTS.sponsors_label} />
      <Grid container sx={{ margin: 2 }}>
        {sponsors.map((sponsor, idx) =>
          <Grid key={idx} size={sponsor.Id === bill.PrimeSponsorID ? 12 : 4}>
            <Stack direction={'row'}>
              <NavLink
                title={`Open ${bill.BillId}`}
                to={`/bill/${bill.BillId}`}>
                {sponsor.LastName}, {sponsor.FirstName}
              </NavLink>
              <Typography sx={{ marginLeft: 1 }}>{sponsor.Id === bill.PrimeSponsorID ? "  (Primary)" : ""}</Typography>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Card >
  )
};


