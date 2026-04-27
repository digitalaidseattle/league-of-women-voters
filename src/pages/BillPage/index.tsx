/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { HomeOutlined } from "@ant-design/icons";
import { LoadingContext } from "@digitalaidseattle/core";
import { Breadcrumbs, Card, CardHeader, IconButton, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";
import { LegislativeDocument } from "../../api/bill";
import { BillService } from "../../api/billService";
import { LoadingOverlay } from "../../components/LoadingOverlay";

// project import

export const BillPage = () => {
  const { id } = useParams<string>();
  const { loading, setLoading } = useContext(LoadingContext);

  const [bill, setBill] = useState<LegislativeDocument>()

  useEffect(() => {
    console.log(id)
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
        <NavLink to="/bills" >Bills</NavLink>
        <Typography color="text.primary">Bill Detail: {bill?.Id} </Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader title={`${bill?.Id}`} />
      </Card>
    </>
  )
};
