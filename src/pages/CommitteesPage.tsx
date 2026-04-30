// material-ui
import { ExpandAltOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from 'react';

import { PageInfo } from "@digitalaidseattle/core";
import { Box, IconButton, InputAdornment, Link as MuiLink, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { LegislatureService } from '../api/legislatureService';
import { CHAMBER_TYPE, ChamberButtonGroup } from "../components/ChamberButtonGroup";
import { LoadingOverlay } from "../components/LoadingOverlay";
// project import

// ==============================|| SAMPLE PAGE ||============================== //
const PAGE_SIZE = 25;
const COMMITTEE_SEARCH_URL = "https://leg.wa.gov/about-the-legislature/committees/";

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
  const [search, setSearch] = useState("");

  const columns: GridColDef<Committee>[] = useMemo(() => [
    {
      field: "Name",
      headerName: "Name",
      minWidth: 330,
      flex: 1.5,
      type: "string",
      renderCell: (params: GridRenderCellParams<Committee>) => (
        <MuiLink
          component={RouterLink}
          to={`/committee/${params.row.Id}`}
          underline="always"
          color="text.primary"
          sx={{ whiteSpace: "normal", lineHeight: 1.25 }}
        >
          {formatCommitteeName(params.row)}
        </MuiLink>
      )
    },
    {
      field: "chair",
      headerName: "Chair",
      minWidth: 160,
      flex: 0.8,
      valueGetter: (_value, row) => getLeadershipName(row, "chair"),
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "chair")),
      type: "string"
    },
    {
      field: "viceChair",
      headerName: "Vice Chair",
      minWidth: 170,
      flex: 0.85,
      valueGetter: (_value, row) => getLeadershipName(row, "vice"),
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "vice")),
      type: "string"
    },
    {
      field: "minorityChair",
      headerName: "Minority Chair",
      minWidth: 180,
      flex: 0.9,
      valueGetter: (_value, row) => getLeadershipName(row, "ranking"),
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "ranking")),
      type: "string"
    },
    {
      field: "majorityChair",
      headerName: "Majority Chair",
      minWidth: 180,
      flex: 0.9,
      valueGetter: (_value, row) => getLeadershipName(row, "majority"),
      renderCell: (params: GridRenderCellParams<Committee>) => renderName(getLeadershipName(params.row, "majority")),
      type: "string"
    },
    {
      field: "membersCount",
      headerName: "Members",
      width: 120,
      align: "right",
      headerAlign: "right",
      valueGetter: (_value, row) => row.Members?.length ?? 0,
      type: "number"
    }
  ], []);

  useEffect(() => {
    refresh();
  }, []);

  const filteredRows = useMemo(() => {
    const loweredQuery = search.trim().toLowerCase();

    return pageInfo.rows
      .filter(filterPredicate)
      .filter((committee) => {
        if (!loweredQuery) {
          return true;
        }

        const haystack = [
          formatCommitteeName(committee),
          committee.Name,
          committee.LongName,
          committee.Agency,
          getLeadershipName(committee, "chair"),
          getLeadershipName(committee, "vice"),
          getLeadershipName(committee, "ranking"),
          getLeadershipName(committee, "majority"),
          String(committee.Members?.length ?? 0)
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(loweredQuery);
      });
  }, [pageInfo.rows, chamber, search]);

  function refresh() {
    setInitialized(false);
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    });
    LegislatureService.getInstance()
      .getAll()
      .then(committees => {
        setPageInfo({
          rows: committees,
          totalRowCount: committees.length,
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
      case 'joint':
        return committee.Agency === 'Joint'
      case 'all':
      default:
        return true;
    }
  }

  function handleChamberChange(value: CHAMBER_TYPE): void {
    setChamber(value);
  }

  function CustomToolbar() {
    return (
      <Toolbar
        disableGutters
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          gap: 1.5,
          justifyContent: "space-between",
          flexWrap: "wrap",
          mb: 0.25
        }}
      >
        <ChamberButtonGroup chamber={chamber} onChange={handleChamberChange} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { md: "auto" } }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            placeholder="Search"
            aria-label="Search committees"
            sx={{ width: { xs: "100%", sm: 240 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }
            }}
          />
          <Tooltip title="Open committee directory">
            <IconButton
              color="primary"
              onClick={() => window.open(COMMITTEE_SEARCH_URL, "_blank", "noopener")}
              aria-label="Open committee directory"
            >
              <ExpandAltOutlined />
            </IconButton>
          </Tooltip>
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={refresh} aria-label="Refresh committees">
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
        </Box>
      </Toolbar>
    );
  }

  function getLeadershipName(committee: Committee, role: string) {
    const leadership = committee.Leadership ?? [];
    const found = leadership.find((leader) => {
      const normalizedRole = leader.role.toLowerCase();

      if (role === "chair") {
        return normalizedRole.includes("chair") &&
          !normalizedRole.includes("vice") &&
          !normalizedRole.includes("minority") &&
          !normalizedRole.includes("majority");
      }

      if (role === "vice") {
        return normalizedRole.includes("vice");
      }

      if (role === "ranking") {
        return normalizedRole.includes("ranking") &&
          !normalizedRole.includes("assistant");
      }

      if (role === "majority") {
        return normalizedRole.includes("majority");
      }

      return false;
    });
    return formatPersonName(found?.name ?? "");
  }

  function formatCommitteeName(committee: Committee) {
    const chamberPrefix = committee.Agency === "House" || committee.Agency === "Senate" || committee.Agency === "Joint"
      ? `${committee.Agency} `
      : "";
    const rawName = committee.LongName || committee.Name;
    return rawName.startsWith(chamberPrefix) ? rawName : `${chamberPrefix}${rawName}`;
  }

  function renderName(name: string) {
    if (!name) {
      return "";
    }

    return (
      <MuiLink component="span" underline="always" color="text.primary">
        {name}
      </MuiLink>
    );
  }

  function formatPersonName(name: string) {
    const [lastName, firstName] = name.split(",").map((part) => part.trim());
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return name;
  }

  return (<>
    <LoadingOverlay loading={!initialized} />
    <Box sx={{ px: { xs: 1, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, mb: 2.5 }}>
        Committees
      </Typography>
      <DataGrid
        apiRef={apiRef}
        autoHeight
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row.Id}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowClick={openCommittee}
        showToolbar={true}
        slots={{ toolbar: CustomToolbar }}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": { borderTop: "1px solid", borderColor: "divider" },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .MuiDataGrid-cell": { py: 2, alignItems: "center" }
        }}
      />
    </Box>
  </>
  )
};

export default CommitteesPage;
