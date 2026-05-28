import { PageInfo } from "@digitalaidseattle/core";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Committee } from "../../api/committee";
import { LegislationInfo } from "../../api/bill";

const PAGE_SIZE = 25;

const InCommitteeGrid = (props: { committee: Committee }) => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [pageInfo, setPageInfo] = useState<PageInfo<LegislationInfo>>({
    rows: [],
    totalRowCount: 0,
  });

  const columns: GridColDef<LegislationInfo>[] = [
    {
      field: "BillId",
      headerName: "Bill Id",
      width: 100,
      type: "string"
    },
    {
      field: "OriginalAgency",
      headerName: "Orig Agency",
      width: 300,
      type: "string"
    }
  ]

  useEffect(() => {
    if (props.committee) {
      refresh()
    }
  }, [props]);

  function refresh() {
    const inCommittee = props.committee.InCommittee ?? [];
    setPageInfo({
      rows: inCommittee,
      totalRowCount: inCommittee.length,
    })
  }

  return (
    <DataGrid
      apiRef={apiRef}
      rows={pageInfo.rows}
      columns={columns}
      getRowId={(row) => row.BillId}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  )
}

export default InCommitteeGrid;