// material-ui
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
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
        field: "Id",
        headerName: "",
        width: 100,
        renderCell: (params) => {
          return (
            <Tooltip title="View Members">
              <IconButton
                color="primary"
                onClick={() => {
                  const committee = params.row;
                  window.location.href = `/committee-page?agency=${committee.Agency}&committeeName=${encodeURIComponent(committee.Name)}`;
                }}
              >
                <InfoCircleOutlined />
              </IconButton>
            </Tooltip>
          );
        }
      },
      {
        field: "Name",
        headerName: "Name",
        width: 200,
        type: "string"
      },
      {
        field: "Acronym",
        headerName: "Acronym",
        width: 100,
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

  return (
    <Box sx={{ marginTop: 1 }}>
      <Toolbar>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          Sponsors
        </Typography>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <DataGrid
        getRowId={(row) => row.Id}
        apiRef={apiRef}
        rows={pageInfo.rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Box>
  )
};

export default SponsorsPage;
