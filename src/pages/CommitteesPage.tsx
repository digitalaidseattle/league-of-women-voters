/**
 *  CommitteesPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ExpandAltOutlined, ExportOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { FilterItem, LoadingContext, PageInfo, QueryModel, useNotifications } from "@digitalaidseattle/core";
import { Box, Card, CardContent, IconButton, InputAdornment, Link as MuiLink, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridSortModel, useGridApiRef } from "@mui/x-data-grid";
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Committee } from '../api/committee';
import { LegislatureService } from '../api/legislatureService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";

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
        <MuiLink
          component={RouterLink}
          to={`/committee/${params.row.Id}`}
          underline="always"
          color="text.primary"
          sx={{ whiteSpace: "normal", lineHeight: 1.25 }}
        >
          {formatCommitteeName(params.row)}
        </MuiLink>
      )
    },
    {
      field: "chair",
      headerName: "Chair",
      minWidth: 160,
      flex: 0.8,
      valueGetter: (_value, row) => getLeadershipName(row, "chair"),
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "chair")),
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
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "vice")),
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
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "ranking")),
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
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "majority")),
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
      <Toolbar
        disableGutters
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          gap: 1.5,
          justifyContent: "space-between",
          flexWrap: "wrap",
          mb: 0.25
        }}
      >
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { md: "auto" } }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            placeholder="Search"
            aria-label="Search committees"
            sx={{ width: { xs: "100%", sm: 240 } }}
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
        </Box>
      </Toolbar>
    );
  }

  function getLeadershipName(committee: Committee, role: string) {
    const leadership = committee.Leadership ?? [];
    const found = leadership.find((leader) => {
      const normalizedRole = leader.role.toLowerCase();

      if (role === "chair") {
        return normalizedRole.includes("chair") &&
          !normalizedRole.includes("vice") &&
          !normalizedRole.includes("minority") &&
          !normalizedRole.includes("majority");
      }

      if (role === "vice") {
        return normalizedRole.includes("vice");
      }

      if (role === "ranking") {
        return normalizedRole.includes("ranking") &&
          !normalizedRole.includes("assistant");
      }

      if (role === "majority") {
        return normalizedRole.includes("majority");
      }

      return false;
    });
    return formatPersonName(found?.name ?? "");
  }

  function formatCommitteeName(committee: Committee) {
    return committee.LongName || committee.Name;
  }

  function renderName(name: string) {
    if (!name) {
      return "";
    }

    return (
      <MuiLink component="span" underline="always" color="text.primary">
        {name}
      </MuiLink>
    );
  }

  function formatPersonName(name: string) {
    const [lastName, firstName] = name.split(",").map((part) => part.trim());
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return name;
  }

  return (<>
    <LoadingOverlay loading={loading} />
    <Card sx={{ mx: { xs: 1, md: 3 }, my: { xs: 2, md: 4 } }}>
      <CardContent>
        <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, mb: 2.5 }}>
          Committees
        </Typography>
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
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { borderTop: "1px solid", borderColor: "divider" },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
            "& .MuiDataGrid-row": { cursor: "pointer" },
            "& .MuiDataGrid-cell": { py: 2, alignItems: "center" }
          }}
        />
      </CardContent>
    </Card>
  </>);
};

export default CommitteesPage;
