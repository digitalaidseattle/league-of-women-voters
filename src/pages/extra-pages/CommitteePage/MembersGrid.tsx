import { PageInfo } from "@digitalaidseattle/supabase";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LegislatureService } from "../../../api/legislatureService";

const PAGE_SIZE = 25;

const MembersGrid = (props: { agency: string, committeeName: string }) => {
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
      .getCommitteeMembers(props.agency, props.committeeName)
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
        field: "Email",
        headerName: "Email",
        width: 200,
        type: "string"
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
    <DataGrid
      getRowId={(row) => row.Id}
      apiRef={apiRef}
      rows={pageInfo.rows}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  )
}

export default MembersGrid;