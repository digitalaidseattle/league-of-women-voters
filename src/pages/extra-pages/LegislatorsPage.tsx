import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";

// material-ui
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, Toolbar, useGridApiRef } from "@mui/x-data-grid";

import { PageInfo } from "@digitalaidseattle/supabase";
import { LegislatorService } from '../../api/legislatorService';
import { ChamberButtonGroup } from "../../components/ChamberButtonGroup";
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

export const LegislatorsPage = () => {
  const apiRef = useGridApiRef();
  const navigate = useNavigate();

  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });

  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({
    rows: [],
    totalRowCount: 0,
  });

  const [chamber, setChamber] = useState<string>('all');

  useEffect(() => {
    setColumns(getColumns());
    refresh()
  }, []);

  useEffect(() => {
    refresh();
  }, [chamber]);

  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })
    LegislatorService.getInstance()
      .getAll()
      .then(response =>
        setPageInfo({
          rows: response.filter(filterPredicate),
          totalRowCount: response.length,
        }))
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  function filterPredicate(leg: Member): boolean {
    switch (chamber) {
      case 'house':
        return leg.Agency === 'House'
      case 'senate':
        return leg.Agency === 'Senate'
      case 'all':
      case 'joint':
      default:
        return true;
    }
  }

  function handleChmberChange(value: string): void {
    setChamber(value);
    refresh();
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
  };

  function CustomToolbar() {

    return (<Toolbar>
      <ChamberButtonGroup chamber={chamber} onChange={handleChmberChange} />
    </Toolbar>
    );
  }
  return (<>
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Legislators</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title="Legislators"
        action={
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={refresh}>
              <ReloadOutlined />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <DataGrid
          getRowId={(row) => row.Id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowDoubleClick={params => navigate(`/legislator/${params.row.Id}`)}
          showToolbar={true}
          slots={{ toolbar: CustomToolbar }}
        />
      </CardContent>
    </Card>
  </>
  )
};
