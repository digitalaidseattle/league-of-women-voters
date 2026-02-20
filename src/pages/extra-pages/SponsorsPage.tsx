// material-ui
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";

import { PageInfo } from "@digitalaidseattle/supabase";
import { LegislatureService } from '../../api/legislatureService';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

const SponsorsPage = () => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Committee>>({
    rows: [],
    totalRowCount: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    setColumns(getColumns());
    refresh()
  }, []);


  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })
    LegislatureService.getInstance()
      .getSponsors()
      .then(response =>
        setPageInfo({
          rows: response,
          totalRowCount: response.length,
        }))
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  const getColumns = (): GridColDef[] => {
    return [
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
  };

  function CustomToolbar() {
    return (
      <Toolbar>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
    )
  }

  return (<>
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Sponsors</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Sponsors" />
      <CardContent>
        <DataGrid
          getRowId={(row) => row.Id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowDoubleClick={params => navigate(`/sponsor?id=${params.row.Id}`)}
          showToolbar={true}
          slots={{ toolbar: CustomToolbar }}
        />
      </CardContent>
    </Card>
  </>
  )
};

export default SponsorsPage;
