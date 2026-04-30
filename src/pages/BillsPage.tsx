/**
 *  BillsPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  ExpandAltOutlined,
  HomeOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Breadcrumbs,
  Card,
  CardHeader,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  Toolbar,
  useGridApiRef
} from "@mui/x-data-grid";

import { LoadingContext, PageInfo } from "@digitalaidseattle/core";
import type { BillRow } from "../api/bill";
import { BillService } from "../api/billService";
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { BillsService } from "../utils/bills";

const BILL_SEARCH_URL = "https://app.leg.wa.gov/billsearch/";
const PAGE_SIZE = 25;

const columns: GridColDef<BillRow>[] = [
  {
    field: "billNumber",
    headerName: "Bill",
    width: 120,
    type: "string"
  },
  {
    field: "committee",
    headerName: "Committee",
    flex: 1,
    width: 120,
    type: "string"
  },
  {
    field: "title",
    headerName: "Title",
    flex: 1,
    minWidth: 260,
    type: "string"
  },
  {
    field: "history",
    headerName: "Bill History",
    flex: 1,
    minWidth: 240,
    type: "string"
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    type: "string",
    renderCell: (params) => {
      const { row } = params;
      if (row.status && row.status.startsWith("http")) {
        return (
          <Link
            href={row.status}
            target="_blank"
            rel="noopener noreferrer"
          >
            Bill Status
          </Link>
        );
      }
      return row.status;
    }
  },
  {
    field: "latestDocumentLabel",
    headerName: "Latest Available Documents",
    flex: 1,
    minWidth: 240,
    type: "string",
    renderCell: (params) => {
      const { row } = params;
      if (row.latestDocumentUrl) {
        return (
          <Link
            href={row.latestDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.latestDocumentLabel}
          </Link>
        );
      }
      return row.latestDocumentLabel;
    }
  }
];

export const BillsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [pageInfo, setPageInfo] = useState<PageInfo<BillRow>>({ rows: [], totalRowCount: 0, });
  const { loading, setLoading } = useContext(LoadingContext);
  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');

  useEffect(() => {
    fetchData();
  }, [chamber, search]);

  function fetchData() {
    setLoading(true);
    setPageInfo({ rows: [], totalRowCount: 0 });
    BillService.getInstance()
      .getAll()
      .then(data => {
        const rows = data
          .map((bill) => BillsService.mapLegislativeDocumentToBillRow(bill)!)
          .filter(b => b !== undefined)
          .filter(row => rowFilter(row));
        setPageInfo({
          rows: rows,
          totalRowCount: rows.length,
        });
      })
      .finally(() => setLoading(false));
  };

  function rowFilter(bill: BillRow): boolean {
    const matchesTab =
      chamber === "all" ? true : bill.chamber.toLowerCase() === chamber;

    if (!matchesTab) {
      return false;
    }

    const loweredQuery = search.trim().toLowerCase();
    if (!loweredQuery) {
      return true;
    }

    const haystack = [
      bill.billNumber,
      bill.title,
      bill.committee,
      bill.status,
      bill.history,
      bill.latestDocumentLabel
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(loweredQuery);
  }

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function CustomToolbar() {
    return (
      <Toolbar>
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          placeholder="Search"
          sx={{ width: 220, mr: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              )
            }
          }}
        />
        <Tooltip title="Open Bill Search">
          <IconButton
            color="primary"
            onClick={() => window.open(BILL_SEARCH_URL, "_blank", "noopener")}
          >
            <ExpandAltOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" size="small" onClick={fetchData}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
    );
  }

  return (<>
    <LoadingOverlay loading={loading} />
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Bills</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Bills" />
      <DataGrid
        apiRef={apiRef}
        autoHeight
        rows={pageInfo.rows}
        columns={columns}
        getRowId={(row) => row.id}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowDoubleClick={params => navigate(`/bill/${params.row.id}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  );
}
