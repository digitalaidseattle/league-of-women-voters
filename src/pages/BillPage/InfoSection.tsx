/**
 *  InfoSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { ExportOutlined } from "@ant-design/icons";
import { Grid, Link, Paper, Typography } from '@mui/material';

import dayjs from "dayjs";
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bill, BillHistoryEntry } from '../../api/bill';
import { BillService } from '../../api/billService';
import { Committee } from "../../api/committee";
import { BILL_CONSTANTS } from "./constants";

type LatestAction = Pick<BillHistoryEntry, 'ActionDate' | 'HistoryLine'>;

export function InfoSection({ bill }: { bill: Bill }) {
  const billService = BillService.getInstance();
  const [committee, setCommittee] = useState<Committee>();
  const [latestAction, setLatestAction] = useState<LatestAction>();

  useEffect(() => {
    billService.findInCommittee(bill)
      .then(resp => setCommittee(resp));
  }, [bill]);

  // Use the bill's current status; if it has none, use the last entry of its full history
  useEffect(() => {
    if (bill.CurrentStatus) {
      setLatestAction(bill.CurrentStatus);
      return;
    }
    setLatestAction(undefined);
    billService.getHistory(bill)
      .then(entries => setLatestAction(entries.length > 0
        ? entries.reduce((latest, entry) => dayjs(entry.ActionDate).isBefore(latest.ActionDate) ? latest : entry)
        : undefined))
      .catch(err => console.error('Error loading bill history:', err));
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
        <Grid size={4}>{BILL_CONSTANTS.status}:</Grid>
        <Grid size={8}>{bill.CurrentStatus?.Status}</Grid>
        <Grid size={4}>{BILL_CONSTANTS.history}:</Grid>
        <Grid size={8}>
          {latestAction && <>
            <Typography variant="body2" color="text.secondary">
              {dayjs(latestAction.ActionDate).format('MMM D, YYYY')}
            </Typography>
            <Typography>{latestAction.HistoryLine}</Typography>
          </>}
          <NavLink to={`/bill/${bill.BillId}/history`}>
            {BILL_CONSTANTS.view_full_history}
          </NavLink>
        </Grid>
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
