/**
 *  LegislatorsPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";

// material-ui
import { ExportOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumbs, Card, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, Toolbar, useGridApiRef } from "@mui/x-data-grid";

import { FilterItem, LoadingContext, QueryModel, useNotifications } from '@digitalaidseattle/core';
import { PageInfo } from "@digitalaidseattle/core";
import { LegislatorService } from '../api/legislatorService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Member } from '../api/committee';
import { GridSortModel } from '@mui/x-data-grid';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

export const LegislatorsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { loading, setLoading } = useContext(LoadingContext);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({ rows: [], totalRowCount: 0, });

  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');

  const columns: GridColDef[] =
    [
      {
        field: "Name",
        headerName: "Name",
        width: 200,
        type: "string"
      },
      {
        field: "FirstName",
        headerName: "First Name",
        width: 200,
        type: "string"
      },
      {
        field: "LastName",
        headerName: "Last Name",
        width: 200,
        type: "string"
      },
      {
        field: "Agency",
        headerName: "Chamber",
        width: 100,
        type: "string"
      },
      {
        field: "Party",
        headerName: "Party",
        width: 75,
        type: "string"
      },
      {
        field: "District",
        headerName: "District",
        width: 75,
        type: "number"
      },
      {
        field: "Email",
        headerName: "Email",
        width: 250,
        type: "string"
      },
      {
        field: "Phone",
        headerName: "Phone",
        width: 150,
        type: "string"
      }
    ];

  useEffect(() => {
    refresh();
  }, [chamber]);

  function refresh() {
    setLoading(false);
    setPageInfo({ rows: [], totalRowCount: 0, });
    LegislatorService.getInstance()
      .find(createQueryModel())
      .then(data => setPageInfo(data))
      .catch(err => {
        notifications.error('Error fetching legislators.');
        console.error('Error fetching legislators:', err);
      })
      .finally(() => setLoading(false))
  }

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function createQueryModel(): QueryModel {
    const filterItems: FilterItem[] = [];
    const agency = chamber === 'house' ? "House" : (chamber === 'senate' ? "Senate" : undefined);
    if (agency) {
      filterItems.push({
        field: 'OriginalAgency',
        operator: '=',
        value: agency
      })
    }
    const sortField = "id";
    const sortDirection = "asc";
    return {
      ...paginationModel,
      sortField: sortField,
      sortDirection: sortDirection,
      filterModel: {
        items: filterItems
      }
    } as QueryModel;
  }

  function exportData() {
    setLoading(true);
    LegislatorService.getInstance()
      .exportData(createQueryModel())
      .then(() => notifications.success('Bills exported successfully'))
      .catch(err => {
        notifications.error('Error exporting bills.');
        console.error('Error exporting bills:', err);
      })
      .finally(() => setLoading(false));
  };

  function CustomToolbar() {
    return (
      <Toolbar>
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <Tooltip title="Export">
          <IconButton color="primary" size="small" onClick={exportData}>
            <ExportOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" size="small" onClick={refresh}>
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
      <Typography color="text.primary">Legislators</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Legislators" />
      <DataGrid
        apiRef={apiRef}
        rows={pageInfo.rows}
        columns={columns}
        getRowId={(row) => row.Id}

        pageSizeOptions={[10, 25, 50, 100]}
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

        onRowDoubleClick={params => navigate(`/legislator/${params.row.Id}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  )
};
