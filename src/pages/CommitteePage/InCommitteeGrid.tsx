import { PageInfo } from "@digitalaidseattle/core";
import { Link as MuiLink } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BillService } from "../../api/billService";
import { Committee } from "../../api/committee";
import { CommitteeBillRow, mapCommitteeBillRow } from "../../utils/committees";

const PAGE_SIZE = 25;

const InCommitteeGrid = (props: { committee: Committee, search?: string, refreshKey?: number }) => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [pageInfo, setPageInfo] = useState<PageInfo<CommitteeBillRow>>({
    rows: [],
    totalRowCount: 0,
  });

  const filteredRows = useMemo(() => {
    const loweredQuery = props.search?.trim().toLowerCase();
    if (!loweredQuery) {
      return pageInfo.rows;
    }

    return pageInfo.rows.filter((row) =>
      [
        row.bill,
        row.originalSponsor,
        row.title,
        row.status,
        row.history
      ]
        .join(" ")
        .toLowerCase()
        .includes(loweredQuery)
    );
  }, [pageInfo.rows, props.search]);

  const columns: GridColDef<CommitteeBillRow>[] = [
    {
      field: "bill",
      headerName: "Bill",
      minWidth: 130,
      flex: 0.6,
      type: "string",
      renderCell: (params: GridRenderCellParams<CommitteeBillRow>) => {
        if (params.row.billPageId) {
          return (
            <NavLink to={`/bill/${params.row.billPageId}`}>
              {params.row.bill}
            </NavLink>
          );
        }

        return (
          <MuiLink href={params.row.billSearchUrl} target="_blank" rel="noopener noreferrer" underline="always" color="text.primary">
            {params.row.bill}
          </MuiLink>
        );
      }
    },
    {
      field: "originalSponsor",
      headerName: "Original Sponsor",
      minWidth: 180,
      flex: 0.9,
      type: "string",
      renderCell: (params: GridRenderCellParams<CommitteeBillRow>) => params.row.originalSponsor
    },
    {
      field: "title",
      headerName: "Title",
      minWidth: 230,
      flex: 1.2,
      type: "string"
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.7,
      type: "string"
    },
    {
      field: "history",
      headerName: "Bill History",
      minWidth: 260,
      flex: 1.4,
      type: "string"
    },
    {
      field: "billPage",
      headerName: "Current Bill page",
      minWidth: 190,
      flex: 0.9,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CommitteeBillRow>) => {
        if (params.row.billPageId) {
          return (
            <NavLink to={`/bill/${params.row.billPageId}`}>
              Link to Bill page
            </NavLink>
          );
        }

        return (
          <MuiLink href={params.row.billSearchUrl} target="_blank" rel="noopener noreferrer" underline="always">
            Link to Bill page
          </MuiLink>
        );
      }
    }
  ];

  useEffect(() => {
    if (props.committee) {
      refresh();
    }
  }, [props.committee, props.refreshKey]);

  function refresh() {
    const inCommittee = props.committee.InCommittee ?? [];
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    });

    BillService.getInstance()
      .getAll()
      .then((bills) => {
        const rows = inCommittee.map((legislation) => mapCommitteeBillRow(legislation, bills));
        setPageInfo({
          rows,
          totalRowCount: rows.length,
        });
      })
      .catch((error) => {
        console.error('Error loading committee bill details:', error);
        const rows = inCommittee.map((legislation) => mapCommitteeBillRow(legislation, []));
        setPageInfo({
          rows,
          totalRowCount: rows.length,
        });
      });
  }

  return (
    <DataGrid
      apiRef={apiRef}
      autoHeight
      rows={filteredRows}
      columns={columns}
      getRowId={(row) => row.id}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
      getRowHeight={() => "auto"}
      disableRowSelectionOnClick
    />
  );
};

export default InCommitteeGrid;
