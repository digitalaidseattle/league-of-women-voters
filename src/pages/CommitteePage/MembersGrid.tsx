import { CopyOutlined } from "@ant-design/icons";
import { PageInfo, useNotifications } from "@digitalaidseattle/core";
import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LegislatorService } from "../../api/legislatorService";

const PAGE_SIZE = 25;

const MembersGrid = (props: { committee: Committee, search?: string }) => {
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

  const filteredRows = useMemo(() => {
    const loweredQuery = props.search?.trim().toLowerCase();
    if (!loweredQuery) {
      return pageInfo.rows;
    }

    return pageInfo.rows.filter((member) =>
      [
        member.Name,
        member.Party,
        member.District,
        member.Email,
        member.Phone,
        getLegislativeAssistantNames(member),
        getLegislativeAssistantEmails(member)
      ]
        .join(" ")
        .toLowerCase()
        .includes(loweredQuery)
    );
  }, [pageInfo.rows, props.search, legislators]);

  const columns: GridColDef[] =
    [
      {
        field: "Name",
        headerName: "Name",
        minWidth: 180,
        flex: 1,
        type: "string",
        renderCell: (params: GridRenderCellParams<Member>) => {
          const legislator = params.row;
          return (
            <Link to={`/legislator/${legislator.Id}`}>{legislator.Name}</Link>
          );
        }
      },
      {
        field: "Party",
        headerName: "Party",
        minWidth: 120,
        flex: 0.6,
        type: "string"
      },
      {
        field: "District",
        headerName: "District",
        width: 110,
        align: "right",
        headerAlign: "right",
        type: "number"
      },
      {
        field: "Email",
        headerName: "Email",
        minWidth: 240,
        flex: 1.2,
        type: "string"
      },
      {
        field: "Phone",
        headerName: "Phone",
        minWidth: 150,
        flex: 0.8,
        type: "string"
      },
      {
        field: "legislativeAssistant",
        headerName: "Legislative Assistant",
        minWidth: 210,
        flex: 1,
        type: "string",
        valueGetter: (_value, row) => getLegislativeAssistantNames(row),
      },
      {
        field: "legislativeAssistantEmail",
        headerName: "LA Email",
        minWidth: 210,
        flex: 1,
        type: "string",
        valueGetter: (_value, row) => getLegislativeAssistantEmails(row),
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
    return Promise.all((props.committee.Members ?? []).map(mm => legislatorService.getById(mm.Id)))
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

  function getLegislativeAssistantNames(member: Member) {
    const found = legislators.find(mm => mm.Id === member.Id) ?? member;
    return (found.LegislativeAssistant ?? []).map(la => la.name).join(", ");
  }

  function getLegislativeAssistantEmails(member: Member) {
    const found = legislators.find(mm => mm.Id === member.Id) ?? member;
    const emails = (found.LegislativeAssistant ?? [])
      .map((la) => (la as { email?: string; Email?: string }).email ?? (la as { email?: string; Email?: string }).Email)
      .filter((email): email is string => typeof email === "string" && email.trim().length > 0);

    return emails.join(", ");
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
        autoHeight
        rows={filteredRows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
          "& .MuiDataGrid-cell": { py: 2, alignItems: "center" }
        }}
      />
    </Box>
  )
}

export default MembersGrid;
