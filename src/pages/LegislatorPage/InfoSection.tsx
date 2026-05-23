/**
 *  InfoSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Grid, Paper } from '@mui/material';
import { LEGISLATORS_CONSTANTS } from './constants';

export function InfoSection({ legislator }: { legislator: Member }) {
  return (
    <Paper sx={{ padding: 2, height: "100%" }}>
      <Grid container>
        <Grid size={4}>{LEGISLATORS_CONSTANTS.name_label}: </Grid>
        <Grid size={8}>{legislator.Name}</Grid>
        <Grid size={4}>{LEGISLATORS_CONSTANTS.email_label}:</Grid>
        <Grid size={8}>{legislator.Email}</Grid>
        <Grid size={4}>{LEGISLATORS_CONSTANTS.phone_label}:</Grid>
        <Grid size={8}>{legislator.Phone}</Grid>
        <Grid size={4}>{LEGISLATORS_CONSTANTS.address_label}:</Grid>
        <Grid size={8}>{legislator.Address}</Grid>
        <Grid size={4}>{LEGISLATORS_CONSTANTS.legislative_asst_label}:</Grid>
        <Grid size={8}>{(legislator.LegislativeAssistant ?? []).map(la => la.name).join(', ')}</Grid>
      </Grid>
    </Paper>
  )
};

