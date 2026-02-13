import {
  ReloadOutlined,
  SearchOutlined,
  ExpandAltOutlined
} from "@ant-design/icons";
import {
  Box,
  IconButton,
  InputAdornment,
  Link,
  Tab,
  Tabs,
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
import { mapLegislativeDocumentToBillRow, sanitizeBillUrl } from "../../utils/bills";
import { mapOpenStatesBillToBillRow } from "../../utils/openStateBills"
import { LegBill } from "../../api/openStatesBill";

const DEFAULT_DOCUMENT_CLASS = "Bills";
const BILL_SEARCH_URL = "https://app.leg.wa.gov/billsearch/";
const PAGE_SIZE = 25;

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
  const [rawBills, setRawBills] = useState<LegBill[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE
  });

  const fetchBills = useCallback(() => {
    setLoading(true);
    LegislatureService.getInstance()
      .getOpenStatesBills(1, 8)
      .then((response) => {
        const docs = Array.isArray(response) ? response : [];
        docs.forEach(() => {
          // const rawUrl =
          //   doc.Url ??
          //   doc.Hyperlink ??
          //   doc.SourceUrl ??
            // "";
          // const sanitizedUrl = sanitizeBillUrl(rawUrl, doc);
         
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
    console.log(rawBills)
    return rawBills
      .map((bill) => mapOpenStatesBillToBillRow (bill))
      .filter(Boolean) as BillRow[];
  }, [rawBills]);

  const filteredRows = useMemo(() => {
    const loweredQuery = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesTab =
        tab === "all" ? true : row.chamber.toLowerCase() === tab;

      if (!matchesTab) {
        return false;
      }

      if (!loweredQuery) {
        return true;
      }

      const haystack = [
        row.billNumber,
        row.title,
        row.committee,
        row.status,
        row.history,
        row.latestDocumentLabel
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(loweredQuery);
    });
  }, [rows, tab, search]);
  return (
    <Box sx={{ marginTop: 1 }}>
      <Toolbar>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          Bills
        </Typography>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          placeholder="Search"
          sx={{ width: 220, mr: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
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
          <IconButton color="primary" onClick={fetchBills}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Tabs
        value={tab}
        onChange={(_event, value: TabValue) => setTab(value)}
        aria-label="bill chamber filter"
        sx={{ mb: 2 }}
      >
        {tabs.map((tabOption) => (
          <Tab key={tabOption.value} label={tabOption.label} value={tabOption.value} />
        ))}
      </Tabs>
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
        onRowDoubleClick={(params) => {
          const row = params.row as BillRow;
          const targetBill =
            row?.normalizedBillNumber ||
            row?.billNumber?.replace(/\D+/g, "") ||
            "";
          const rawName = row?.raw?.Name ?? "";
          if (!targetBill) {
            return;
          }
          navigate(`/bill?number=${encodeURIComponent(targetBill)}&name=${encodeURIComponent(rawName)}`);
        }}
      />
    </Box>
  );
};

export default BillsPage;
