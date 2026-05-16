/**
 *  InfoSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { ExportOutlined } from "@ant-design/icons";
import { Grid, Link, Paper } from '@mui/material';

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bill } from '../../api/bill';
import { BillService } from '../../api/billService';
import { BILL_CONSTANTS } from './constants';

export function InfoSection({ bill }: { bill: Bill }) {
  const billService = BillService.getInstance();
  const [committee, setCommittee] = useState<Committee>();

  useEffect(() => {
    billService.findInCommittee(bill)
      .then(resp => setCommittee(resp));
  }, [bill]);

  return (
    <Paper sx={{ padding: 2, height: "100%" }}>
      <Grid container spacing={2}>
        <Grid size={4}>{BILL_CONSTANTS.in_committee_label}: </Grid>
        <Grid size={8}>{committee &&
          <NavLink
            title={`Open committee ${committee.Name}`}
            to={`/committee/${committee.Id}`}
          >
            {committee.Name}
          </NavLink>}
        </Grid>
        <Grid size={4}>{BILL_CONSTANTS.title_label}:</Grid>
        <Grid size={8}>{bill.LegalTitle}</Grid>
        <Grid size={4}>{BILL_CONSTANTS.hearing_date_label}:</Grid>
        <Grid size={8}>{'N/A'}</Grid>
        <Grid size={4}>{BILL_CONSTANTS.status}:</Grid>
        <Grid size={8}>{bill.CurrentStatus.Status}</Grid>
        <Grid size={4}>{BILL_CONSTANTS.history}:</Grid>
        <Grid size={8}>{bill.CurrentStatus?.HistoryLine}</Grid>
        <Grid size={4}>{BILL_CONSTANTS.current_page}:</Grid>
        <Grid size={8}>
          <Link
            title={`Open WA Leg ${bill.BillId}`}
            href={billService.getBillUrl(bill)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {bill.BillId} <ExportOutlined />
          </Link>

        </Grid>
      </Grid>
    </Paper>
  )
};

