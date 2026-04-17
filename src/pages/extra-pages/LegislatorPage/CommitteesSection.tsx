/**
 *  CommitteesSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import React, { useEffect, useState } from 'react';

import { Card, CardHeader, Grid, Typography } from '@mui/material';
import { LegislatureService } from '../../../api/legislatureService';
import { LEGISLATORS_CONSTANTS } from './constants';
import { Link } from "react-router-dom";
import { sleep } from '../../../utils/sleep';

export function CommitteesSection({ legislator }: { legislator: Member }) {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (legislator) {
      fetchData();
    }
  }, [legislator])

  async function fetchData() {
    const service = LegislatureService.getInstance();
    return service.findCommitteesByMember(legislator)
      .then(resp => {
        setCommittees(resp);
        setLoaded(true);
      })
      .catch(async err => {
        if (err.message === 'Committee members not loaded.') {
          await sleep(3000);
          fetchData();
        }
      })
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.committees_label} />
      <Grid container sx={{ margin: 2 }}>
        <Typography>WIP</Typography>
        {loaded && committees.map((committee, idx) => {
          return <React.Fragment key={idx}>
            <Grid size={9}><Link to={`/committee?agency=${committee.Agency}&committeeName=${committee.Name}`}>{committee.Name}</Link></Grid>
            <Grid size={3}>?? role ??</Grid>
          </React.Fragment>
        })}
      </Grid>
    </Card>
  )
};


