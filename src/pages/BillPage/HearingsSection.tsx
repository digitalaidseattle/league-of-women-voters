/**
 *  HearingsSection.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { LoadingContext } from '@digitalaidseattle/core';
import { Card, CardHeader, Grid, Typography } from '@mui/material';
import dayjs from "dayjs";
import { useContext, useEffect, useState } from 'react';
import { Bill, BillHearing } from '../../api/bill';
import { BillDao } from '../../api/billDao';
import { BILL_CONSTANTS } from './constants';

export function HearingsSection({ bill }: { bill: Bill }) {
  const billDao = BillDao.getInstance();
  const [hearings, setHearings] = useState<BillHearing[]>([]);
  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
    billDao.getBillHearings(bill.BillNumber)
      .then(resp => {
        setHearings(resp.sort((a, b) => {
          const aDate = dayjs(a.CommitteeMeeting.RevisedDate);
          const bDate = dayjs(b.CommitteeMeeting.RevisedDate);
          return bDate.diff(aDate);
        }))
      })
      .finally(() => setLoading(false))
  }, [bill]);


  return (<>
    <Card sx={{ height: "100%" }}>
      <CardHeader title={BILL_CONSTANTS.hearing_date_label} />
      <Grid container sx={{ margin: 2 }}>
        <Grid size={12}>
          {hearings.map((hearing, idx) => <Typography>{`${dayjs(hearing.CommitteeMeeting.RevisedDate).format('MM/DD/YYYY')}`}</Typography>)}
        </Grid>
      </Grid>
    </Card >
  </>
  )
};


