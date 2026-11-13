/**
 *  BillPage/HistoryPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { HomeOutlined } from "@ant-design/icons";
import { LoadingContext, useNotifications } from "@digitalaidseattle/core";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import dayjs from "dayjs";
import { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";
import { BillHistoryEntry } from "../../api/bill";
import { BillService } from "../../api/billService";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { BILL_CONSTANTS } from "./constants";

// WA Leg returns the history once per version of the bill (e.g. SB and SSB),
// so the same action can appear more than once
function removeDuplicates(entries: BillHistoryEntry[]): BillHistoryEntry[] {
  const seen = new Set<string>();
  return entries.filter(entry => {
    const key = `${entry.ActionDate}|${entry.HistoryLine}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

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
          removeDuplicates(entries).sort((a, b) => dayjs(a.ActionDate).diff(dayjs(b.ActionDate)))
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
          {years.map((year, index) => (
            <Box key={year} sx={{ mt: index === 0 ? 0 : 4 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {BILL_CONSTANTS.year_label}: {year}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 120, fontWeight: 700 }}>{BILL_CONSTANTS.date_label}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{BILL_CONSTANTS.description_label}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history
                    .filter(entry => dayjs(entry.ActionDate).format('YYYY') === year)
                    .map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{dayjs(entry.ActionDate).format('MMM D')}</TableCell>
                        <TableCell>{entry.HistoryLine}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
