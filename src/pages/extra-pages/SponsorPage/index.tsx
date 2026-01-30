// material-ui

import {
  HomeOutlined
} from "@ant-design/icons";
import { Breadcrumbs, Card, CardHeader, IconButton, Typography } from '@mui/material';
import { NavLink, useSearchParams } from "react-router-dom";

const SponsorPage = () => {
  const [searchParams] = useSearchParams();
  const sponsorId = searchParams.get("id")!;

  return (

    <>
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/sponsors" >Sponsors</NavLink>
        <Typography color="text.primary">Sponsor Detail</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader title={`Sponsor Page id = ${sponsorId}`} />
      </Card>
    </>
  )
};

export default SponsorPage;
