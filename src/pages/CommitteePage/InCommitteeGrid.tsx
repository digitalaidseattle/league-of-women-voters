import { PageInfo } from "@digitalaidseattle/core";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LegislatureService } from "../../api/legislatureService";
import { LegislationInfo } from "../../api/bill";

const PAGE_SIZE = 25;

const InCommitteeGrid = (props: { agency: string, committeeName: string }) => {
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
    if (props.committeeName && props.agency) {
      refresh()
    }
  }, [props]);

  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })

    LegislatureService.getInstance()
      .getInCommittee(props.agency, props.committeeName)
      .then(response => {
        console.log("Response from getInCommittee:", response);
        setPageInfo({
          rows: response,
          totalRowCount: response.length,
        })
      })
      .catch(error => {
        console.error('Error invoking function:', error);
      });
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