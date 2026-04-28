// material-ui
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/core";
import { Breadcrumbs, Card, CardContent, CardHeader, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { NavLink, useNavigate } from "react-router-dom";
import { LegislatureService } from '../api/legislatureService';
import { LoadingOverlay } from "../components/LoadingOverlay";
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
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
  const [initialized, setInitialized] = useState(false);
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
    setInitialized(false);
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    });
    LegislatureService.getInstance()
      .getAll()
      .then(committees => {
        const rows = committees.filter(filterPredicate);
        setPageInfo({
          rows: rows,
          totalRowCount: rows.length,
        });
      }).finally(() => {
        setInitialized(true);
      })
  }

  const openCommittee = (params: any) => {
    const committee = params.row;
    navigate(`/committee/${committee.Id}`);
    //    navigate(`/committee?agency=${committee.Agency}&committeeName=${encodeURIComponent(committee.Name)}`);
  };


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
    <LoadingOverlay loading={!initialized} />
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
        onRowDoubleClick={openCommittee}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
      />
    </Card>
  </>
  )
};

export default CommitteesPage;
