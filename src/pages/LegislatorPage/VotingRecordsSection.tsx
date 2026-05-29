/**
 *  VotingRecordsSection.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardContent, CardHeader, Link } from '@mui/material';
import { LEGISLATORS_CONSTANTS } from './constants';
import { Member } from '../../api/committee';

export function VotingRecordsSection({ legislator }: { legislator: Member }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={LEGISLATORS_CONSTANTS.voting_records_label} />
      <CardContent>
        <Link href={`https://leg.wa.gov/votingrecord/house/2025/${legislator.Id}.pdf`}
          target="_blank"
          rel="noopener"
        >Voting records for 2025</Link>
      </CardContent>
    </Card>
  )
};

