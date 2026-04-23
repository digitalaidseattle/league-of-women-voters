import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";

// material-ui
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumbs, Card, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";

import { LoadingContext } from '@digitalaidseattle/core';
import { PageInfo } from "@digitalaidseattle/core";
import { LegislatorService } from '../../api/legislatorService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../../components/ChamberButtonGroup";
import { LoadingOverlay } from '../../components/LoadingOverlay';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

export const LegislatorsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const { loading, setLoading } = useContext(LoadingContext);

  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({
    rows: [],
    totalRowCount: 0,
  });
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
        field: "Agency",
        headerName: "Chamber",
        width: 100,
        type: "string"
      },
      {
        field: "Party",
        headerName: "Party",
        width: 50,
        type: "string"
      },
      {
        field: "District",
        headerName: "District",
        width: 50,
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
      .getAll()
      .then(legislators => {
        const rows = legislators.filter(filterPredicate);
        setPageInfo({
          rows: rows,
          totalRowCount: rows.length,
        });
      })
      .finally(() => setLoading(false))
  }

  function filterPredicate(legislator: Member): boolean {
    switch (chamber) {
      case 'house':
        return legislator.Agency === 'House'
      case 'senate':
        return legislator.Agency === 'Senate'
      case 'all':
      case 'joint':
      default:
        return true;
    }
  }

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function CustomToolbar() {
    return (
      <Toolbar>
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh}>
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
        autoHeight
        rows={pageInfo.rows}
        columns={columns}
        getRowId={(row) => row.Id}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowDoubleClick={params => navigate(`/legislator/${params.row.Id}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  )
};
