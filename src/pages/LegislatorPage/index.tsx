/**
 *  LegislatorPage/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import {
  HomeOutlined
} from "@ant-design/icons";
import { Breadcrumbs, Card, CardContent, CardHeader, Grid, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { LegislatorService } from "../../api/legislatorService";
import { CommitteesSection } from "./CommitteesSection";
import { InfoSection } from "./InfoSection";
import { SponsoredBillsSection } from "./SponsoredBillsSection";
import { VotingRecordsSection } from "./VotingRecordsSection";
import { LEGISLATORS_CONSTANTS } from "./constants";
import { Member } from "../../api/committee";

const LegislatorPage = () => {
  const { id } = useParams<string>();

  const [legislator, setLegislator] = useState<Member>()

  useEffect(() => {
    LegislatorService.getInstance()
      .getById(Number(id))
      .then(leg => setLegislator(leg))
  }, [id]);

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/legislators" >{LEGISLATORS_CONSTANTS.legislators_label}</NavLink>
        <Typography color="text.primary">{`${LEGISLATORS_CONSTANTS.legislator_label} ${LEGISLATORS_CONSTANTS.detail_label}`}</Typography>
      </Breadcrumbs>
      {legislator &&
        <Card>
          <CardHeader title={legislator.Name} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={6}><InfoSection legislator={legislator} /></Grid>
              <Grid size={6}><CommitteesSection legislator={legislator} /></Grid>
              <Grid size={6}><SponsoredBillsSection legislator={legislator} /></Grid>
              <Grid size={6}><VotingRecordsSection legislator={legislator} /></Grid>
            </Grid>
          </CardContent>
        </Card>
      }
      {!legislator &&
        <Card>
          <CardHeader title={LEGISLATORS_CONSTANTS.not_founnd} />
        </Card>
      }

    </>
  )
};

export default LegislatorPage;
