import {
  ReloadOutlined,
  SearchOutlined,
  ExpandAltOutlined
} from "@ant-design/icons";
import { PageInfo } from "@digitalaidseattle/supabase";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  type GridPaginationModel,
  useGridApiRef
} from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LegislatureService } from "../../api/legislatureService";
import type { BillRow, LegislativeDocument } from "../../api/bill";
import { BillsService } from "../../utils/bills";

const BILL_SEARCH_URL = "https://app.leg.wa.gov/billsearch/";
const PAGE_SIZE = 25;

const billsPageStyles = {
  card: {
    mt: 1
  },
  cardContent: {
    pt: 0
  }
} as const;

const tabs = [
  { label: "All", value: "all" },
  { label: "House", value: "house" },
  { label: "Senate", value: "senate" },
  { label: "Joint", value: "joint" }
] as const;

type TabValue = (typeof tabs)[number]["value"];

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
    minWidth: 220,
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
    field: "status",
    headerName: "Status",
    width: 160,
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

const BillsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [tab, setTab] = useState<CHAMBER_TYPE>('all');
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [bills, setBills] = useState<BillRow[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<BillRow>>({ rows: [], totalRowCount: 0, });
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filter();
  }, [bills, tab, search]);

  function fetchData() {
    setLoading(true);
    BillService.getInstance()
      .getAll()
      .then(data => {
        const mapped = data
          .map((bill, index) => mapLegislativeDocumentToBillRow(bill, index)!)
          .filter(b => b !== undefined);
        setBills(mapped);
      })
      .finally(() => setLoading(false));
  };

  function filter() {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    });
    const rows = bills
      .filter(row => rowFilter(row));
    setPageInfo({
      rows: rows,
      totalRowCount: rows.length,
    });
  };

  function rowFilter(bill: BillRow): boolean {
    const matchesTab =
      tab === "all" ? true : bill.chamber.toLowerCase() === tab;

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

  function CustomToolbar() {
    return (<Toolbar>
      <ChamberButtonGroup chamber={tab} onChange={setTab} />

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

  return (<>
    <LoadingOverlay loading={loading} />
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Bills</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Bills" />
      <CardContent>
        <DataGrid
          apiRef={apiRef}
          autoHeight
          // rows={filteredRows}
          rows={pageInfo.rows}
          columns={columns}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowDoubleClick={(params) => handleRowDoubleClick(params.row as BillRow)}
          slots={{ toolbar: BillsToolbar }}
        />
      </CardContent>
    </Card>
  );
};

export default BillsPage;
