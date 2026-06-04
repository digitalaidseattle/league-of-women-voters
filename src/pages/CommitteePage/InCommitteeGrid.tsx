import { PageInfo } from "@digitalaidseattle/core";
import { Link as MuiLink } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Bill, LegislationInfo } from "../../api/bill";
import { BillService } from "../../api/billService";
import { Committee } from "../../api/committee";

const PAGE_SIZE = 25;

type CommitteeBillRow = {
  id: string;
  bill: string;
  originalSponsor: string;
  title: string;
  status: string;
  history: string;
  billPageId?: string;
  billSearchUrl: string;
};

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
            <MuiLink component={RouterLink} to={`/bill/${params.row.billPageId}`} underline="always" color="text.primary">
              {params.row.bill}
            </MuiLink>
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
      renderCell: (params: GridRenderCellParams<CommitteeBillRow>) => (
        <MuiLink component="span" underline="always" color="text.primary">
          {params.row.originalSponsor}
        </MuiLink>
      )
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
            <MuiLink component={RouterLink} to={`/bill/${params.row.billPageId}`} underline="always">
              Link to Bill page
            </MuiLink>
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
        const rows = inCommittee.map((legislation) => toCommitteeBillRow(legislation, bills));
        setPageInfo({
          rows,
          totalRowCount: rows.length,
        });
      })
      .catch((error) => {
        console.error('Error loading committee bill details:', error);
        const rows = inCommittee.map((legislation) => toCommitteeBillRow(legislation, []));
        setPageInfo({
          rows,
          totalRowCount: rows.length,
        });
      });
  }

  function toCommitteeBillRow(
    legislation: LegislationInfo,
    bills: Bill[]
  ): CommitteeBillRow {
    const bill = findBill(legislation, bills);

    return {
      id: legislation.BillId,
      bill: bill?.BillId ?? legislation.BillId,
      originalSponsor: formatSponsor(bill),
      title: bill?.LegalTitle ?? bill?.LongDescription ?? bill?.ShortDescription ?? "",
      status: bill?.CurrentStatus?.Status ?? "",
      history: formatHistory(bill),
      billPageId: bill?.BillId,
      billSearchUrl: getBillSearchUrl(bill, legislation)
    };
  }

  function findBill(legislation: LegislationInfo, bills: Bill[]) {
    const normalizedBillId = normalizeBillId(legislation.BillId);
    return bills.find((bill) =>
      normalizeBillId(bill.BillId) === normalizedBillId ||
      String(bill.BillNumber) === String(legislation.BillNumber)
    );
  }

  function normalizeBillId(value: string | number | undefined) {
    return String(value ?? "").replace(/\s+/g, "").toUpperCase();
  }

  function formatSponsor(bill?: Bill) {
    const sponsor = bill?.Sponsors?.[0];
    if (sponsor) {
      return sponsor.Name || `${sponsor.FirstName ?? ""} ${sponsor.LastName ?? ""}`.trim();
    }
    return bill?.Sponsor ?? "";
  }

  function formatHistory(bill?: Bill) {
    if (!bill?.CurrentStatus) {
      return "";
    }
    const date = formatDate(bill.CurrentStatus.ActionDate);
    return [date, bill.CurrentStatus.HistoryLine].filter(Boolean).join(" ");
  }

  function formatDate(raw?: string) {
    if (!raw) {
      return "";
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return raw;
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function getBillSearchUrl(bill: Bill | undefined, legislation: LegislationInfo) {
    const biennium = bill?.Biennium ?? legislation.Biennium;
    const year = biennium?.split("-")[0] ?? "";
    const billNumber = bill?.BillNumber ?? legislation.BillNumber;
    return `https://app.leg.wa.gov/billsummary/?BillNumber=${billNumber}&Year=${year}`;
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
      sx={{
        border: 0,
        "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
        "& .MuiDataGrid-cell": {
          alignItems: "center",
          minHeight: "96px",
          py: 2,
          whiteSpace: "normal",
          lineHeight: 1.25
        }
      }}
    />
  );
};

export default InCommitteeGrid;
