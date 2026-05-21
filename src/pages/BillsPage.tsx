/**
 *  BillsPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  HomeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import {
  Breadcrumbs,
  Card,
  CardHeader,
  IconButton,
  Link,
  Tooltip,
  Typography
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  Toolbar,
  useGridApiRef
} from "@mui/x-data-grid";

import { FilterItem, LoadingContext, PageInfo, QueryModel } from "@digitalaidseattle/core";
import type { Bill } from "../api/bill";
import { BillService } from "../api/billService";
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { SearchField } from "../components/SearchField";
import { GridSortModel } from "@mui/x-data-grid";

const PAGE_SIZE = 25;

export const BillsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Bill>>({ rows: [], totalRowCount: 0, });
  const { loading, setLoading } = useContext(LoadingContext);
  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');

  useEffect(() => {
    fetchData();
  }, [chamber, search, paginationModel, sortModel, filterModel]);

  useEffect(() => {
    console.log(filterModel);
  }, [filterModel]);

  function fetchData() {
    setLoading(true);
    const filterItems: FilterItem[] = [];
    const agency = chamber === 'house' ? "House" : (chamber === 'senate' ? "Senate" : undefined);
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
    if (filterModel && filterModel.items.length > 0) {
      const filterItem = filterModel.items[0];
      filterItems.push({
        field: filterItem.field,
        operator: filterItem.operator,
        value: filterItem.value
      })
    }

    const sortField = sortModel && sortModel.length > 0 ? sortModel![0].field : '';
    const sortDirection = sortModel && sortModel.length > 0 ? sortModel![0].sort : '';
    BillService.getInstance()
      .find({
        ...paginationModel,
        sortField: sortField,
        sortDirection: sortDirection,
        filterModel: {
          items: filterItems
        }
      } as QueryModel)
      .then(data => setPageInfo(data))
      .finally(() => setLoading(false));
  };

  const columns: GridColDef<Bill>[] = [
    {
      field: "id",
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
      type: "boolean",
      filterable: false,
      sortable: false,
    },
    {
      field: "CommitteeName",
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
      type: "string",
      filterable: false,
      sortable: false,
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
      },
      filterable: false,
      sortable: false,

    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      type: "string",
      renderCell: (params) => {
        const { row } = params;
        return row.CurrentStatus ? row.CurrentStatus.Status : 'n/a';
      },
      filterable: false,
      sortable: false,
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
        <SearchField value={search} onChange={(value) => setSearch(value)} />
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

        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}

        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}

        pageSizeOptions={[10, 25, 50, 100]}
        onRowDoubleClick={params => navigate(`/bill/${params.row.BillId}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  );
}
