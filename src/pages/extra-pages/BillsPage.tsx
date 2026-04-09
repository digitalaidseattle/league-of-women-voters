import {
  ReloadOutlined,
  SearchOutlined,
  ExpandAltOutlined
} from "@ant-design/icons";
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

const DEFAULT_DOCUMENT_CLASS = "Bills";
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
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [rawBills, setRawBills] = useState<LegislativeDocument[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE
  });

  const fetchBills = useCallback(() => {
    setLoading(true);
    LegislatureService.getInstance()
      .getBills(DEFAULT_DOCUMENT_CLASS)
      .then((response) => {
        const docs = Array.isArray(response) ? response : [];
        docs.forEach((doc) => {
          const rawUrl =
            doc.Url ??
            doc.Hyperlink ??
            doc.SourceUrl ??
            "";
          const sanitizedUrl = BillsService.sanitizeBillUrl(rawUrl, doc);
          console.log("Fetched bill document URL:", sanitizedUrl);
        });
        setRawBills(docs);
      })
      .catch((error) => {
        console.error("Error loading bills:", error);
        setRawBills([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [tab, search]);

  const rows = useMemo<BillRow[]>(() => {
    return rawBills
      .map((bill, index) => BillsService.mapLegislativeDocumentToBillRow(bill, index))
      .filter(Boolean) as BillRow[];
  }, [rawBills]);

  const filterPredicate = useMemo(() => {
    return BillsService.buildFilterPredicate({ tab, query: search });
  }, [tab, search]);

  const filteredRows = useMemo(() => rows.filter(filterPredicate), [rows, filterPredicate]);

  const handleRowDoubleClick = useCallback((row: BillRow) => {
    const targetBill =
      row?.normalizedBillNumber ||
      row?.billNumber?.replace(/\D+/g, "") ||
      "";
    const rawName = row?.raw?.Name ?? "";
    if (!targetBill) {
      return;
    }
    navigate(`/bill?number=${encodeURIComponent(targetBill)}&name=${encodeURIComponent(rawName)}`);
  }, [navigate]);

  const handleOpenBillSearch = useCallback(() => {
    window.open(BILL_SEARCH_URL, "_blank", "noopener");
  }, []);

  const BillsToolbar = () => (
    <Toolbar sx={{ justifyContent: "space-between", gap: 2, p: 1 }}>
      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={(_event, value: TabValue | null) => {
          if (value) {
            setTab(value);
          }
        }}
        aria-label="bill chamber filter"
      >
        {tabs.map((tabOption) => (
          <ToggleButton
            key={tabOption.value}
            value={tabOption.value}
            aria-label={tabOption.label}
          >
            {tabOption.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          placeholder="Search"
          sx={{ width: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
          }}
        />
        <Tooltip title="Open Bill Search">
          <IconButton color="primary" onClick={handleOpenBillSearch}>
            <ExpandAltOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={fetchBills}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );

  return (
    <Card sx={billsPageStyles.card}>
      <CardHeader
        title={<Typography variant="h3">Bills</Typography>}
      />
      <CardContent sx={billsPageStyles.cardContent}>
        <DataGrid
          apiRef={apiRef}
          autoHeight
          rows={filteredRows}
          columns={columns}
          loading={loading}
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
