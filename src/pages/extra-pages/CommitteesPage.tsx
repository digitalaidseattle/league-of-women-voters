// material-ui
import { ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Card, CardContent, CardHeader, IconButton, Toolbar, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
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
    <Card>
      <CardHeader title="Committees" />
      <CardContent sx={{ padding: 0.5 }}>
        <DataGrid
          getRowId={(row) => row.Id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowDoubleClick={openCommittee}
          showToolbar={true}
          slots={{ toolbar: CustomToolbar }}
        />
      </CardContent>
    </Card>



  )
};

export default CommitteesPage;
