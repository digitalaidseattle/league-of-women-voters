import { PageInfo } from "@digitalaidseattle/core";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LegislatureService } from "../../api/legislatureService";

const PAGE_SIZE = 25;

type Referral = {
  id: string
  BillId: string
  OriginalAgency: string
  ReferredDate: string
  CommitteeId: string
  CommitteeName: string
  Agency: string
}


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

  function toReferral(referral: any): Referral {
    console.log("Converting referral:", referral);
    return {
      id: `${referral.Committee.Id}-${referral.LegislationInfo.BillId}`,
      BillId: referral.LegislationInfo.BillId,
      OriginalAgency: referral.LegislationInfo.OriginalAgency,
      ReferredDate: referral.ReferredDate,
      CommitteeId: referral.Committee.Id,
      CommitteeName: referral.Committee.Name,
      Agency: referral.Committee.Agency
    }
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