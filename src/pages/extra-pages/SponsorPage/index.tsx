// material-ui

import { Box, Typography } from '@mui/material';
import { useSearchParams } from "react-router-dom";


const SponsorPage = () => {
  const [searchParams] = useSearchParams();
  const sponsorId = searchParams.get("id")!;

  return (
    <Box sx={{ marginTop: 1 }}>
      <Typography>Sponsor Page id = {sponsorId}</Typography>
    </Box>
  )
};

export default SponsorPage;
