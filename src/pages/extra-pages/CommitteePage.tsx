// material-ui
import { ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/supabase";
import { Box, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import { LegislatureService } from '../../api/legislatureService';
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;

const CommitteePage = () => {
  const apiRef = useGridApiRef();
  const [searchParams] = useSearchParams();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({
    rows: [],
    totalRowCount: 0,
  });

  const committeeName = searchParams.get("committeeName")!;
  const agency = searchParams.get("agency")!;

  useEffect(() => {
    setColumns(getColumns());
  }, []);

  useEffect(() => {
    if (committeeName && agency) {
      refresh()
    }
  }, [committeeName, agency]);

  function exportData() {
    const csvContent = pageInfo.rows.map(row => {
      return Object.values(row).join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${committeeName}_members.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })
    LegislatureService.getInstance()
      .getCommitteeMembers(agency, committeeName)
      .then(response => {
        setPageInfo({
          rows: response,
          totalRowCount: response.length,
        })
      })
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  const getColumns = (): GridColDef[] => {
    return [
      // {
      //   field: "Id",
      //   headerName: "Id",
      //   width: 100,
      //   type: "number"
      // },
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
        width: 100,
        type: "string"
      },
      {
        field: "District",
        headerName: "District",
        width: 100,
        type: "number"
      },
      {
        field: "LongName",
        headerName: "Long Name",
        width: 300,
        type: "string"
      }
    ];
  };

  return (
    <Box sx={{ marginTop: 1 }}>
      <Toolbar>
        <Stack sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>Agency: {agency}</Typography>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>Committee: {committeeName}</Typography>
        </Stack>
        <Tooltip title="Export">
          <IconButton color="primary" onClick={exportData}>
            <ExportOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>Members</Typography>
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

export default CommitteePage;
