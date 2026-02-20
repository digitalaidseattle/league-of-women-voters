// material-ui
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from 'react';

import { LoadingContext } from "@digitalaidseattle/core";
import { PageInfo } from "@digitalaidseattle/supabase";
import { Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";
import { NavLink, useNavigate } from "react-router-dom";
import { LegislatorService } from "../../api/legislatorService";
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

const LegislatorsPage = () => {
  const { loading, setLoading } = useContext(LoadingContext);
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [pageInfo, setPageInfo] = useState<PageInfo<Committee>>({
    rows: [],
    totalRowCount: 0,
  });

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      type: "string",
    },
    {
      field: "party",
      headerName: "Party",
      width: 100,
      type: "string"
    },
    {
      field: "current_role.title",
      headerName: "Chamber",
      width: 150,
      type: "string",
      renderCell: (params) => {
        return params.row.current_role.title
      }
    },
    {
      field: "current_role.district",
      headerName: "District",
      width: 100,
      type: "string",
      renderCell: (params) => {
        return params.row.current_role.district
      }
    }
  ]

  const navigate = useNavigate();

  useEffect(() => {
    fetchData()
  }, []);

  function fetchData() {
    setLoading(true);
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })
    LegislatorService.getInstance()
      .getAll()
      .then(response => {
        console.log('response', response);
        setPageInfo({
          rows: response ?? [],
          totalRowCount: (response ?? []).length,
        })
      })
      .catch(error => {
        console.error('Error invoking function:', error);
      })
      .finally(() => setLoading(false));
  }

  function CustomToolbar() {
    return (
      <Toolbar>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={fetchData}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
    )
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <Typography color="text.primary">Legislators</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader title="Legislators" />
        <CardContent sx={{ padding: 0.5 }}>
          <DataGrid
            apiRef={apiRef}
            rows={pageInfo.rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            onRowDoubleClick={params => navigate(`/sponsor?id=${params.row.Id}`)}
            showToolbar={true}
            slots={{ toolbar: CustomToolbar }}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
};

export default LegislatorsPage;