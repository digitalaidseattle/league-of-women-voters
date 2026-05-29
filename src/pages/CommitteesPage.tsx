/**
 *  CommitteesPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// material-ui
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";

import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumbs, Card, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";

import { LoadingContext, PageInfo } from "@digitalaidseattle/core";
import { LegislatureService } from '../api/legislatureService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { Committee } from '../api/committee';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

const CommitteesPage = () => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [pageInfo, setPageInfo] = useState<PageInfo<Committee>>({
    rows: [],
    totalRowCount: 0,
  });

  const navigate = useNavigate()
  const { loading, setLoading } = useContext(LoadingContext);
  const [chamber, setChamber] = useState<CHAMBER_TYPE>('all');

  const columns: GridColDef<Committee>[] = [
    {
      field: "Name",
      headerName: "Name",
      width: 200,
      type: "string"
    },
    {
      field: "Agency",
      headerName: "Agency",
      width: 100,
      type: "string"
    },
    {
      field: "Phone",
      headerName: "Phone",
      width: 150,
      type: "string"
    },
    {
      field: "LongName",
      headerName: "LongName",
      width: 300,
      type: "string"
    }
  ];

  useEffect(() => {
    refresh();
  }, [chamber]);

  function refresh() {
    setLoading(false);
    setPageInfo({ rows: [], totalRowCount: 0, });
    LegislatureService.getInstance()
      .getAll()
      .then(committees => {
        const rows = committees.filter(filterPredicate);
        setPageInfo({
          rows: rows,
          totalRowCount: rows.length,
        });
      })
      .finally(() => setLoading(false))
  }

  function filterPredicate(committee: Committee): boolean {
    switch (chamber) {
      case 'house':
        return committee.Agency === 'House'
      case 'senate':
        return committee.Agency === 'Senate'
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
      <Typography color="text.primary">Committees</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Committees" />
      <DataGrid
        apiRef={apiRef}
        rows={pageInfo.rows}
        columns={columns}
        getRowId={(row) => row.Id}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowDoubleClick={params => navigate(`/committee/${params.row.Id}`)}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  )
};

export default CommitteesPage;
