import { PageInfo } from "@digitalaidseattle/core";
import { Link as MuiLink } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { BillRow, LegislativeDocument } from "../../api/bill";
import { BillService } from "../../api/billService";
import { LegislatureService } from "../../api/legislatureService";
import { LegislationInfo } from "../../api/bill";
import { BillsService } from "../../utils/bills";

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

const InCommitteeGrid = (props: { agency: string, committeeName: string, search?: string, refreshKey?: number }) => {
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
  ]

  useEffect(() => {
    if (props.committeeName && props.agency) {
      refresh()
    }
  }, [props.agency, props.committeeName, props.refreshKey]);

  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })

    Promise.all([
      LegislatureService.getInstance().getInCommittee(props.agency, props.committeeName),
      BillService.getInstance().getAll()
    ])
      .then(([response, bills]) => {
        const billRows = bills
          .map((bill) => BillsService.mapLegislativeDocumentToBillRow(bill))
          .filter((billRow): billRow is BillRow => billRow !== undefined);
        const rows = response.map((legislation) => toCommitteeBillRow(legislation, bills, billRows));

        setPageInfo({
          rows,
          totalRowCount: rows.length,
        })
      })
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  function toCommitteeBillRow(
    legislation: LegislationInfo,
    bills: LegislativeDocument[],
    billRows: BillRow[]
  ): CommitteeBillRow {
    const normalizedBillId = normalizeBillId(legislation.BillId);
    const billRow = billRows.find((row) =>
      normalizeBillId(row.billNumber) === normalizedBillId ||
      row.normalizedBillNumber === legislation.BillNumber?.toString()
    );
    const rawBill = billRow
      ? bills.find((bill) => bill.Id === billRow.id || bill.Name === billRow.id)
      : undefined;

    return {
      id: legislation.BillId,
      bill: billRow?.billNumber ?? legislation.BillId,
      originalSponsor: formatSponsor(rawBill),
      title: billRow?.title ?? "",
      status: billRow?.status ?? "",
      history: billRow?.history ?? "",
      billPageId: billRow?.id,
      billSearchUrl: `https://app.leg.wa.gov/billsummary?BillNumber=${legislation.BillNumber}&Year=${legislation.Biennium}`
    };
  }

  function normalizeBillId(value: string | number | undefined) {
    return String(value ?? "").replace(/\s+/g, "").toUpperCase();
  }

  function formatSponsor(bill?: LegislativeDocument) {
    const sponsor = bill?.Sponsors?.[0];
    if (!sponsor) {
      return "";
    }
    return sponsor.Name || `${sponsor.FirstName ?? ""} ${sponsor.LastName ?? ""}`.trim();
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
  )
}

export default InCommitteeGrid;
