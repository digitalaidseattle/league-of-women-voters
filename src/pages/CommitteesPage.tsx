/**
 *  CommitteesPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ExpandAltOutlined, ExportOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { FilterItem, LoadingContext, PageInfo, QueryModel, useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Card, CardHeader, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridSortModel, useGridApiRef } from "@mui/x-data-grid";
import { useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { Committee } from '../api/committee';
import { LegislatureService } from '../api/legislatureService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { SearchField } from "../components/SearchField";
import { formatCommitteeName, getLeadershipName } from "../utils/committees";

const PAGE_SIZE = 25;
const COMMITTEE_SEARCH_URL = "https://leg.wa.gov/about-the-legislature/committees/";

const CommitteesPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { loading, setLoading } = useContext(LoadingContext);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Committee>>({ rows: [], totalRowCount: 0 });
  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');
  const [search, setSearch] = useState("");

  const columns: GridColDef<Committee>[] = useMemo(() => [
    {
      field: "Name",
      headerName: "Name",
      minWidth: 330,
      flex: 1.5,
      type: "string",
      renderCell: (params: GridRenderCellParams<Committee>) => (
        <NavLink to={`/committee/${params.row.Id}`}>
          {formatCommitteeName(params.row)}
        </NavLink>
      )
    },
    {
      field: "chair",
      headerName: "Chair",
      minWidth: 160,
      flex: 0.8,
      valueGetter: (_value, row) => getLeadershipName(row, "chair"),
      renderCell: (params: GridRenderCellParams<Committee>) => getLeadershipName(params.row, "chair"),
      type: "string",
      sortable: false,
      filterable: false
    },
    {
      field: "viceChair",
      headerName: "Vice Chair",
      minWidth: 170,
      flex: 0.85,
      valueGetter: (_value, row) => getLeadershipName(row, "vice"),
      renderCell: (params: GridRenderCellParams<Committee>) => getLeadershipName(params.row, "vice"),
      type: "string",
      sortable: false,
      filterable: false
    },
    {
      field: "minorityChair",
      headerName: "Minority Chair",
      minWidth: 180,
      flex: 0.9,
      valueGetter: (_value, row) => getLeadershipName(row, "ranking"),
      renderCell: (params: GridRenderCellParams<Committee>) => getLeadershipName(params.row, "ranking"),
      type: "string",
      sortable: false,
      filterable: false
    },
    {
      field: "majorityChair",
      headerName: "Majority Chair",
      minWidth: 180,
      flex: 0.9,
      valueGetter: (_value, row) => getLeadershipName(row, "majority"),
      renderCell: (params: GridRenderCellParams<Committee>) => getLeadershipName(params.row, "majority"),
      type: "string",
      sortable: false,
      filterable: false
    },
    {
      field: "membersCount",
      headerName: "Members",
      width: 120,
      align: "right",
      headerAlign: "right",
      valueGetter: (_value, row) => row.Members?.length ?? 0,
      type: "number",
      sortable: false,
      filterable: false
    }
  ], []);

  useEffect(() => {
    refresh();
  }, [chamber, search, paginationModel, sortModel, filterModel]);

  function refresh() {
    setLoading(true);
    LegislatureService.getInstance()
      .find(createQueryModel())
      .then(data => setPageInfo(data))
      .catch(err => {
        notifications.error('Error fetching committees.');
        console.error('Error fetching committees:', err);
      })
      .finally(() => setLoading(false));
  }

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function createQueryModel(): QueryModel {
    const filterItems: FilterItem[] = [];
    const agency = chamber === 'house' ? "House" : chamber === 'senate' ? "Senate" : chamber === 'joint' ? "Joint" : undefined;

    if (agency) {
      filterItems.push({
        field: 'Agency',
        operator: '=',
        value: agency
      });
    }

    if (search.trim().length > 0) {
      filterItems.push({
        field: 'SearchKey',
        operator: 'contains',
        value: search
      });
    }

    if (filterModel.items.length > 0) {
      const filterItem = filterModel.items[0];
      if (filterItem.value !== undefined && filterItem.value !== null && filterItem.value !== '') {
        filterItems.push({
          field: filterItem.field,
          operator: filterItem.operator,
          value: filterItem.value
        });
      }
    }

    const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
    const sortDirection = sortModel.length > 0 ? sortModel[0].sort : 'asc';

    return {
      ...paginationModel,
      sortField,
      sortDirection,
      filterModel: {
        items: filterItems
      }
    } as QueryModel;
  }

  function exportData() {
    setLoading(true);
    LegislatureService.getInstance()
      .exportData(createQueryModel())
      .then(() => notifications.success('Committees exported successfully'))
      .catch(err => {
        notifications.error('Error exporting committees.');
        console.error('Error exporting committees:', err);
      })
      .finally(() => setLoading(false));
  }

  function CustomToolbar() {
    return (
      <Toolbar>
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <SearchField value={search} onChange={(value) => setSearch(value)} />
        <Tooltip title="Open committee directory">
          <IconButton
            color="primary"
            onClick={() => window.open(COMMITTEE_SEARCH_URL, "_blank", "noopener")}
            aria-label="Open committee directory"
          >
            <ExpandAltOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export">
          <IconButton color="primary" size="small" onClick={exportData} aria-label="Export committees">
            <ExportOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" size="small" onClick={refresh} aria-label="Refresh committees">
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
      <Typography color="text.primary">Committees</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Committees" />
        <DataGrid
          apiRef={apiRef}
          autoHeight
          rows={pageInfo.rows}
          columns={columns}
          getRowId={(row) => row.Id}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          paginationModel={paginationModel}
          rowCount={pageInfo.totalRowCount}
          onPaginationModelChange={setPaginationModel}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          onRowClick={params => navigate(`/committee/${params.row.Id}`)}
          showToolbar={true}
          slots={{ toolbar: CustomToolbar }}
          disableRowSelectionOnClick
        />
    </Card>
  </>);
};

export default CommitteesPage;
