/**
 *  CommitteesSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import React, { useEffect, useState } from 'react';

import { Card, CardHeader, Grid } from '@mui/material';
import { LegislatureService } from '../../../api/legislatureService';
import { LEGISLATORS_CONSTANTS } from './constants';
import { Link } from "react-router-dom";

export function CommitteesSection({ legislator }: { legislator: Member }) {
  const [committees, setCommittees] = useState<Committee[]>([]);

  useEffect(() => {
    lookupCommittees(legislator)
      .then(cc => setCommittees(cc));
  }, [legislator])

  function lookupCommittees(legislator: Member): Promise<Committee[]> {
    const service = LegislatureService.getInstance();
    return service.findCommitteesByMember(legislator)
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.committees_label} />
      <Grid container sx={{ margin: 2 }}>
        {committees.map((committee, idx) => {
          return <React.Fragment key={idx}>
            <Grid size={9}><Link to={`/committee?agency=${committee.Agency}&committeeName=${committee.Name}`}>{committee.Name}</Link></Grid>
            <Grid size={3}>?? role ??</Grid>
          </React.Fragment>
        })}
      </Grid>
    </Card>
  )
};


