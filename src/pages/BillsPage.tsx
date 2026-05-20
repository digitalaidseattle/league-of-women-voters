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

import { FilterItem, LoadingContext, PageInfo, QueryModel } from "@digitalaidseattle/core";
import type { Bill } from "../api/bill";
import { BillService } from "../api/billService";
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";

const BILL_SEARCH_URL = "https://app.leg.wa.gov/billsearch/";
const PAGE_SIZE = 25;

export const BillsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [pageInfo, setPageInfo] = useState<PageInfo<Bill>>({ rows: [], totalRowCount: 0, });
  const { loading, setLoading } = useContext(LoadingContext);
  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');

  useEffect(() => {
    fetchData();
  }, [chamber, search, paginationModel]);

  function fetchData() {
    setLoading(true);
    const filterItems: FilterItem[] = [];
    const agency = chamber === 'house' ? "House" : (chamber === 'senate' ? "Senate" : undefined) ;
    if (agency) {
      filterItems.push({
        field: 'OriginalAgency',
        operator: '=',
        value: agency
      })
    }
    if (search && search.trim() !== '') {
      filterItems.push({
        field: 'SearchKey',
        operator: 'contains',
        value: search
      })
    }
    BillService.getInstance()
      .find({
        ...paginationModel,
        sortField: 'id',
        sortDirection: 'asc',
        filterModel: {
          items: filterItems
        }
      } as QueryModel)
      .then(data => setPageInfo(data))
      .finally(() => setLoading(false));
  };

  const columns: GridColDef<Bill>[] = [
    {
      field: "BillId",
      headerName: "Bill",
      width: 120,
      type: "string",
      renderCell: (params) => {
        const { row } = params;
        const year = row.Biennium.split('-')[0];
        const billNumber = row.BillNumber
        return (<>
          <Link
            title={`Open WA Leg ${row.BillId}`}
            href={`https://app.leg.wa.gov/billsummary/?BillNumber=${billNumber}&Year=${year}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.BillId}
          </Link>
        </>);
      }
    },
    {
      field: "Active",
      headerName: "Active",
      width: 120,
      type: "boolean"
    },
    {
      field: "committee",
      headerName: "In Committee",
      width: 240,
      type: "string",
      renderCell: (params) => {
        const { row } = params;
        const committee = row.InCommittee
        return committee && <NavLink
          title={`Open committee ${committee.Name}`}
          to={`/committee/${committee.Id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {committee.Name}
        </NavLink>
      }
    },
    {
      field: "LegalTitle",
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
      type: "string",
      renderCell: (params) => {
        const { row } = params;
        return row.CurrentStatus ? row.CurrentStatus.HistoryLine : 'n/a';
      }
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      type: "string",
      renderCell: (params) => {
        const { row } = params;
        return row.CurrentStatus ? row.CurrentStatus.Status : 'n/a';
      }
    }
  ];

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function CustomToolbar() {
    return (
      <Toolbar>
        <ChamberButtonGroup
          chamber={chamber}
          onChange={handleChamberChange} />
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
        rows={pageInfo.rows}
        getRowId={(row) => row.BillId}
        columns={columns}

        paginationMode='server'
        paginationModel={paginationModel}
        rowCount={pageInfo.totalRowCount}
        onPaginationModelChange={setPaginationModel}

        // TODO add sort & filter models,  will need to add to DBBill
        // sortingMode="server"
        // sortModel={sortModel}

        pageSizeOptions={[10, 25, 50, 100]}
        onRowDoubleClick={params => navigate(`/bill/${params.row.BillId}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  );
}
