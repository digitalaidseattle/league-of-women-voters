/**
 *  BillPage/HistoryPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { HomeOutlined } from "@ant-design/icons";
import { LoadingContext, useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Card, CardContent, CardHeader, Grid, IconButton, Typography } from '@mui/material';
import dayjs from "dayjs";
import { Fragment, useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";
import { BillHistoryEntry } from "../../api/bill";
import { BillService } from "../../api/billService";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { BILL_CONSTANTS } from "./constants";

export const BillHistoryPage = () => {
  const { id } = useParams<string>();
  const { loading, setLoading } = useContext(LoadingContext);
  const notifications = useNotifications();

  const [history, setHistory] = useState<BillHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const service = BillService.getInstance();
      service.getById(id)
        .then(bill => service.getHistory(bill))
        .then(entries => setHistory(
          [...entries].sort((a, b) => dayjs(a.ActionDate).diff(dayjs(b.ActionDate)))
        ))
        .catch(err => {
          notifications.error('Error loading bill history.');
          console.error('Error loading bill history:', err);
        })
        .finally(() => {
          setLoaded(true);
          setLoading(false);
        });
    }
  }, [id]);

  // Grouped by year, like the history on the leg.wa.gov bill summary
  const years = [...new Set(history.map(entry => dayjs(entry.ActionDate).format('YYYY')))];

  return (
    <>
      <LoadingOverlay loading={loading} />
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/bills" >{BILL_CONSTANTS.bills_label}</NavLink>
        <NavLink to={`/bill/${id}`} >{BILL_CONSTANTS.bill_label}: {id}</NavLink>
        <Typography color="text.primary">{BILL_CONSTANTS.full_history_label}</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader title={`${id} ${BILL_CONSTANTS.full_history_label}`} />
        <CardContent>
          {loaded && history.length === 0 &&
            <Typography>{BILL_CONSTANTS.no_history}</Typography>
          }
          {years.map(year => (
            <Fragment key={year}>
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>{year}</Typography>
              <Grid container spacing={1}>
                {history
                  .filter(entry => dayjs(entry.ActionDate).format('YYYY') === year)
                  .map((entry, idx) => (
                    <Fragment key={idx}>
                      <Grid size={2}>{dayjs(entry.ActionDate).format('MMM D')}</Grid>
                      <Grid size={10}>{entry.HistoryLine}</Grid>
                    </Fragment>
                  ))}
              </Grid>
            </Fragment>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
