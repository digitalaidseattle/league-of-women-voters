import { CopyOutlined } from "@ant-design/icons";
import { PageInfo, useNotifications } from "@digitalaidseattle/core";
import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LegislatorService } from "../../../api/legislatorService";

const PAGE_SIZE = 25;

const MembersGrid = (props: { committee: Committee }) => {
  const apiRef = useGridApiRef();
  const notifications = useNotifications();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [pageInfo, setPageInfo] = useState<PageInfo<Member>>({
    rows: [],
    totalRowCount: 0,
  });
  const [legislators, setLegislators] = useState<Member[]>([]);

  const columns: GridColDef[] =
    [
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
        type: "string",
        renderCell: (params) => {
          const legislator = params.row;
          return (
            <Link to={`/legislator/${legislator.Id}`}>{legislator.Name}</Link>
          );
        }
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
        field: "Id",
        headerName: "Assistant",
        width: 300,
        type: "string",
        valueGetter: (params => {
          const found = legislators.find(mm => mm.Id === params);
          return found ? (found.LegislativeAssistant ?? []).map(la => la.name).join(", ") : ""
        }),
        renderCell: (params => {
          const found = legislators.find(mm => mm.Id === params.row.Id);
          return found ? (found.LegislativeAssistant ?? []).map(la => la.name).join(", ") : ""
        })
      }
    ];

  useEffect(() => {
    refresh()
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
    if (props.committee) {
      fetchLegislators()
        .then(mm => setLegislators(mm));
      setPageInfo({
        rows: props.committee.Members ?? [],
        totalRowCount: (props.committee.Members ?? []).length,
      })
    }
  }
  async function fetchLegislators(): Promise<Member[]> {
    const legislatorService = LegislatorService.getInstance();
    return Promise.all(props.committee.Members.map(mm => legislatorService.getById(mm.Id)))
  }

  async function copyEmails() {
    const emails = pageInfo.rows
      .map((row: any) => row.Email)
      .filter((email: string) => typeof email === "string" && email.trim().length > 0)
      .join(", ");

    if (!emails) {
      notifications.warn("No emails found.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      notifications.success("All committee emails copied.");
    } catch (error) {
      console.error("Failed to copy emails:", error);
      notifications.error("Copy failed. Please try again.");
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<CopyOutlined />}
          onClick={copyEmails}
        >
          Copy all emails
        </Button>
      </Box>
      <DataGrid
        getRowId={(row) => row.Id}
        apiRef={apiRef}
        rows={pageInfo.rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Box>
  )
}

export default MembersGrid;
