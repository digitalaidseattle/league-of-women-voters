import {
  ReloadOutlined,
  SearchOutlined,
  ExpandAltOutlined,
  LeftOutlined
} from "@ant-design/icons";
import {
  Box,
  Breadcrumbs,
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
  type GridColDef,
  useGridApiRef
} from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LegislatureService } from "../../api/legislatureService";
import type { BillRow } from "../../api/bill";
import {
  extractBillNumber,
  mapLegislativeDocumentToBillRow,
  summarizeSponsors
} from "../../utils/bills";

const DEFAULT_DOCUMENT_CLASS = "Bills";

type BillDetailRow = BillRow & {
  sponsors: string;
};

const columns: GridColDef<BillDetailRow>[] = [
  {
    field: "committee",
    headerName: "Committee",
    flex: 1,
    minWidth: 220,
    type: "string",
    renderCell: (params) => params.value
  },
  {
    field: "sponsors",
    headerName: "Sponsors",
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
    headerName: "Current Bill page",
    flex: 1,
    minWidth: 200,
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

const BillDetailPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetNumber = searchParams.get("number") ?? "";
  const targetName = searchParams.get("name") ?? "";

  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState<BillDetailRow | null>(null);

  const heading = useMemo(() => {
    if (bill?.billNumber && bill.billNumber !== "—") {
      return bill.billNumber;
    }
    if (targetName) {
      return targetName;
    }
    if (targetNumber) {
      return `Bill ${targetNumber}`;
    }
    return "Bill detail";
  }, [bill, targetName, targetNumber]);

  const fetchBill = useCallback(() => {
    if (!targetNumber && !targetName) {
      return;
    }
    setLoading(true);
    LegislatureService.getInstance()
      .getBills(DEFAULT_DOCUMENT_CLASS)
      .then((response) => {
        const docs = Array.isArray(response) ? response : [];
        const match = docs.find((doc) => {
          const normalized = extractBillNumber(doc?.Name ?? "", doc);
          if (targetNumber && normalized === targetNumber) {
            return true;
          }
          if (targetName && doc?.Name === targetName) {
            return true;
          }
          return false;
        });
        if (match) {
          const row = mapLegislativeDocumentToBillRow(match, 0);
          if (row) {
            setBill({
              ...row,
              sponsors: summarizeSponsors(match)
            });
          } else {
            setBill(null);
          }
        } else {
          setBill(null);
        }
      })
      .catch((error) => {
        console.error("Error loading bill:", error);
        setBill(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetName, targetNumber]);

  useEffect(() => {
    if (!targetNumber && !targetName) {
      navigate("/bills");
      return;
    }
    fetchBill();
  }, [fetchBill, navigate, targetName, targetNumber]);

  const rows = useMemo(() => {
    return bill ? [bill] : [];
  }, [bill]);

  return (
    <Box sx={{ marginTop: 1 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/bills")}
        >
          <LeftOutlined style={{ fontSize: 12, marginRight: 6 }} />
          Back to Bills
        </Link>
      </Breadcrumbs>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h3" component="div">
            {heading}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TextField
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
            disabled
          />
          <Tooltip title="Open Bill Search">
            <IconButton
              color="primary"
              onClick={() => {
                const url = bill?.latestDocumentUrl ?? "";
                const destination = url || "https://app.leg.wa.gov/billsearch/";
                window.open(destination, "_blank", "noopener");
              }}
            >
              <ExpandAltOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={fetchBill}>
              <ReloadOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <Tabs
        value="details"
        aria-label="bill detail tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Details" value="details" />
      </Tabs>
      <DataGrid
        apiRef={apiRef}
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        hideFooter
      />
    </Box>
  );
};

export default BillDetailPage;
