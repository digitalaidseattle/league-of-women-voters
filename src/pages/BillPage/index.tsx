/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { HomeOutlined } from "@ant-design/icons";
import { LoadingContext } from "@digitalaidseattle/core";
import { Breadcrumbs, Card, CardContent, CardHeader, Grid, IconButton, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";
import { Bill } from "../../api/bill";
import { BillService } from "../../api/billService";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { BILL_CONSTANTS } from "./constants";
import { HearingsSection } from "./HearingsSection";
import { InfoSection } from "./InfoSection";
import { SponsorsSection } from "./SponsorsSection";

// project import

export const BillPage = () => {
  const { id } = useParams<string>();
  const { loading, setLoading } = useContext(LoadingContext);

  const [bill, setBill] = useState<Bill>()

  useEffect(() => {
    if (id) {
      setLoading(true);
      BillService.getInstance()
        .getById(id)
        .then(bill => setBill(bill))
        .finally(() => setLoading(false))
    }
  }, [id]);

  return (bill &&
    <>
      <LoadingOverlay loading={loading} />
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/bills" >{BILL_CONSTANTS.bills_label}</NavLink>
        <Typography color="text.primary">{BILL_CONSTANTS.bill_label}: {bill?.BillId} </Typography>
      </Breadcrumbs>
      {bill &&
        <Card>
          <CardHeader
            title={bill.BillId} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={6}><InfoSection bill={bill} /></Grid>
              <Grid size={6}><SponsorsSection bill={bill} /></Grid>
              <Grid size={6}><HearingsSection bill={bill} /></Grid>
            </Grid>
          </CardContent>
        </Card>
      }
      {!bill &&
        <Card>
          <CardHeader title={BILL_CONSTANTS.not_found} />
        </Card>
      }
    </>
  )
};