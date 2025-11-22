// material-ui
import { ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Box, Card, CardContent, CardHeader, Tooltip } from '@mui/material';
import { ColumnsPanelTrigger, DataGrid, FilterPanelTrigger, GridColDef, GridFilterListIcon, GridViewColumnIcon, Toolbar, ToolbarButton, useGridApiRef } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { LegislatureService } from '../../api/legislatureService';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

const CommitteesPage = () => {
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

  const navigate = useNavigate()

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
      .getCommittees()
      .then(response =>
        setPageInfo({
          rows: response,
          totalRowCount: response.length,
        }))
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  const openCommittee = (params: any) => {
    const committee = params.row;
    navigate(`/committee?agency=${committee.Agency}&committeeName=${encodeURIComponent(committee.Name)}`);
  };

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
  };

  function CommitteesToolbar() {
    return (
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Tooltip title="Refresh">
            <ToolbarButton color="primary" onClick={refresh}>
              <ReloadOutlined />
            </ToolbarButton>
          </Tooltip>
        </Box>
        <Box>
          <ColumnsPanelTrigger render={<ToolbarButton />}>
            <GridViewColumnIcon fontSize="small" />
          </ColumnsPanelTrigger>
          <FilterPanelTrigger render={<ToolbarButton />}>
            <GridFilterListIcon fontSize="small" />
          </FilterPanelTrigger>
        </Box>
      </Toolbar>
    )
  }

  return (
    <Card sx={{ spacing: 0 }}>
      <CardHeader sx={{ padding: 1 }} title="Committees" />
      <CardContent sx={{ padding: 0.5 }}>
        <DataGrid
          sx={{ marginTop: 1 }}
          getRowId={(row) => row.Id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowDoubleClick={openCommittee}

          showToolbar={true}
          slots={{
            toolbar: CommitteesToolbar
          }}
        />
      </CardContent>
    </Card>
  )
};

export default CommitteesPage;
