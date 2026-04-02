import {
  ExpandAltOutlined,
  HomeOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
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
  type GridPaginationModel
} from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { BillRow } from "../../api/bill";
import { LegislatureService } from "../../api/legislatureService";
import { mapOpenStatesBillToBillRow } from "../../utils/openStateBills";
import { LegislativeBill } from "../../api/openStatesBill";
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

const BillsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [rawBills, setRawBills] = useState<LegislativeBill[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE
  });

  const fetchBills = useCallback(() => {
    setLoading(true);
    LegislatureService.getInstance()
      .getOpenStatesBills()
      .then((response) => {
        const docs = response ? response : [];
        docs.forEach(() => {
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
      .map((bill) => mapOpenStatesBillToBillRow(bill))
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
        row.latestDocumentLabel,
        row.status,
        row.history
        
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(loweredQuery);
    });
  }, [rows, tab, search]);

  function CustomToolbar() {
    return (<Toolbar>
      <Box sx={{ marginTop: 1, flexGrow: 1 }}>
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
      </Box>
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
        <IconButton color="primary" size="small" onClick={fetchBills}>
          <ReloadOutlined />
        </IconButton>
      </Tooltip>
    </Toolbar>
    );
  }

  return (<>
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Bills</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Bills" />
      <CardContent>
        <DataGrid
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
          showToolbar={true}
          slots={{ toolbar: CustomToolbar }}
        />
      </CardContent>
    </Card>
  </>
  );
};

export default BillsPage;
