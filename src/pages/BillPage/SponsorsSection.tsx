/**
 *  SponsorsSection.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Card, CardHeader, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Bill } from '../../api/bill';
import { Member } from '../../api/committee';
import { BILL_CONSTANTS } from './constants';

export function SponsorsSection({ bill }: { bill: Bill }) {
    const [sponsors, setSponsors] = useState<Member[]>([]);

    useEffect(() => {
        const temp = bill.Sponsors ?? [];
        // To handle bad data
        const sponsorsArray = Array.isArray(temp) ? temp : [temp];
        console.log("Sponsors for bill", bill.BillId, sponsorsArray);
        setSponsors(sponsorsArray.sort((a, b) => {
            if (a.Id === bill.PrimeSponsorID) {
                return -1
            }
            else if (b.Id === bill.PrimeSponsorID) {
                return 1
            } else {
                return a.LastName.localeCompare(b.LastName)
            }
        }))
    }, [bill]);

    return (
        <Card sx={{ height: "100%" }}>
            <CardHeader title={BILL_CONSTANTS.sponsors_label} />
            <Grid container sx={{ margin: 2 }}>
                {sponsors.map((sponsor, idx) =>
                    <Grid key={idx} size={sponsor.Id === bill.PrimeSponsorID ? 12 : 4}>
                        <Stack direction={'row'}>
                            {/* Consider adding a link
                            <NavLink
                                title={`Open ${bill.BillId}`}
                                to={`/bill/${bill.BillId}`}>
                                {sponsor.Name}  {sponsor.LastName}, {sponsor.FirstName}
                            </NavLink> */}
                            <Typography>{sponsor.Name}</Typography>
                            <Typography sx={{ marginLeft: 1 }}>{sponsor.Id === bill.PrimeSponsorID ? "  (Primary)" : ""}</Typography>
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </Card >
    )
};

