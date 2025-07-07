import { PageInfo } from "@digitalaidseattle/supabase";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LegislatureService } from "../../../api/legislatureService";

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


const ReferralsGrid = (props: { agency: string, committeeName: string }) => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Referral>>({
    rows: [],
    totalRowCount: 0,
  });

  // const [agency, setAgency] = useState<string>("");
  // const [committeeName, setCommitteeName] = useState<string>("");


  useEffect(() => {
    setColumns(getColumns());
  }, []);

  useEffect(() => {
    if (props.committeeName && props.agency) {
      refresh()
    }
  }, [props]);

  // function exportData() {
  //   const csvContent = pageInfo.rows.map(row => {
  //     return Object.values(row).join(",");
  //   }).join("\n");

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", `${props.committeeName}_members.csv`);
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  function refresh() {
    setPageInfo({
      rows: [],
      totalRowCount: 0,
    })

    LegislatureService.getInstance()
      .GetCommitteeReferralsByCommittee(props.agency, props.committeeName)
      .then(response => {
        console.log("Response from GetCommitteeReferralsByCommittee:", response);
        const referrals = response.map((referral: any) => toReferral(referral))
        setPageInfo({
          rows: referrals,
          totalRowCount: referrals.length,
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

  const getColumns = (): GridColDef[] => {
    return [
      // {
      //   field: "Id",
      //   headerName: "Id",
      //   width: 100,
      //   type: "number"
      // },
      {
        field: "BillId",
        headerName: "Bill Id",
        width: 200,
        type: "string"
      },
      {
        field: "OriginalAgency",
        headerName: "Orig Agency",
        width: 100,
        type: "string"
      },
      {
        field: "ReferredDate",
        headerName: "Referred Date",
        width: 300,
        type: "string"
      }
    ];
  };

  return (
    <DataGrid
      apiRef={apiRef}
      rows={pageInfo.rows}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  )
}

export default ReferralsGrid;