import { PageInfo } from "@digitalaidseattle/supabase";
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LegislatureService } from "../../../api/legislatureService";
import { Typography } from "@mui/material";

const PAGE_SIZE = 25;

const ReferralsGrid = (props: { agency: string, committeeName: string }) => {
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({
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
        field: "LegislationInfo.BillId",
        headerName: "Bill Id",
        width: 200,
        type: "string",
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.LegislationInfo.BillId}</Typography>;
        },
        valueGetter: (param: GridRenderCellParams) => {
          console.log("ValueGetter for BillId:", param);
          return "";
        }
      },
      {
        field: "LegislationInfo.OriginalAgency",
        headerName: "Orig Agency",
        width: 100,
        type: "string",
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.LegislationInfo.OriginalAgency}</Typography>;
        },
      },
      {
        field: "ReferredDate",
        headerName: "Referred Date",
        width: 300,
        type: "string",
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.ReferredDate}</Typography>;
        },
      }
    ];
  };

  return (
    <DataGrid
      getRowId={(row) => row.LegislationInfo.BillId}
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