// material-ui
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { NavLink, useNavigate } from "react-router-dom";
import { LegislatureService } from '../../api/legislatureService';
import { LoadingOverlay } from "../../components/LoadingOverlay";
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setColumns(getColumns());
      refresh();
    }
  }, [initialized]);

  function refresh() {
    setInitialized(false);
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    });
    LegislatureService.getInstance()
      .getAll()
      .then(data => {
        setPageInfo({
          rows: data,
          totalRowCount: data.length,
        });
      }).finally(() => {
        setInitialized(true);
      })
  }

  const openCommittee = (params: any) => {
    const committee = params.row;
    console.log(committee);
    navigate(`/committee/${committee.Id}`);
//    navigate(`/committee?agency=${committee.Agency}&committeeName=${encodeURIComponent(committee.Name)}`);
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

  return (<>
    <LoadingOverlay loading={!initialized} />
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Committees</Typography>
    </Breadcrumbs>
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Committees"
        action={<Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>} />
      <CardContent>
        <DataGrid
          getRowId={(row) => row.Id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowDoubleClick={openCommittee}
        />
      </CardContent>
    </Card>
  </>
  )
};

export default CommitteesPage;
