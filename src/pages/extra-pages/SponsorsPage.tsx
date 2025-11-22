// material-ui
import { ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
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
  return (
    <Card sx={{ spacing: 0 }}>
      <CardHeader sx={{ padding: 1 }} title="Sponsors" />
      <CardContent sx={{ padding: 0.5 }}></CardContent>
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
        slots={{
          toolbar: CustomToolbar
        }}
      />
    </Card>
  )
};

export default SponsorsPage;
