/**
 *  CommitteesSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import React, { useEffect, useState } from 'react';

import { Card, CardHeader, Grid } from '@mui/material';
import { Link } from "react-router-dom";
import { LegislatureService } from '../../api/legislatureService';
import { sleep } from '../../utils/sleep';
import { LEGISLATORS_CONSTANTS } from './constants';

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

  function getRole(committee: Committee) {
    // console.log(committee)
    if (committee.Leadership) {
      const leadership = committee.Leadership
        .find(lead => lead.name === `${legislator.LastName}, ${legislator.FirstName}`)
      return leadership ? leadership.role : ''
    } else {
      return 'N/A'
    }
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.committees_label} />
      <Grid container sx={{ margin: 2 }}>
        {loaded && committees.map((committee, idx) => {
          return <React.Fragment key={idx}>
            <Grid size={9}><Link to={`/committee/${committee.Id}`}>{committee.Name}</Link></Grid>
            {/* <Grid size={9}><Link to={`/committee?agency=${committee.Agency}&committeeName=${committee.Name}`}>{committee.Name}</Link></Grid> */}
            <Grid size={3}>{getRole(committee)}</Grid>
          </React.Fragment>
        })}
      </Grid>
    </Card>
  )
};


