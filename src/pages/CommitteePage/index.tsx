/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ExpandAltOutlined, LeftOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Box, Card, CardContent, IconButton, InputAdornment, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from "react-router-dom";
import { Committee } from "../../api/committee";
import { LegislatureService } from "../../api/legislatureService";
import InCommitteeGrid from "./InCommitteeGrid";
import MembersGrid from './MembersGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CommitteePage = () => {
  const { id } = useParams<string>();

  const [value, setValue] = useState(0);
  const [committee, setCommittee] = useState<Committee>();
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      LegislatureService.getInstance()
        .getById(id)
        .then(cc => setCommittee(cc));
    }
  }, [id, refreshKey]);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    );
  }

  function getPageTitle(committee: Committee) {
    const shortName = committee.Name.replace(/\s*Committee$/i, "");
    return `${committee.Agency} Committee Legislation: ${shortName}`;
  }

  const externalUrl = committee
    ? `https://leg.wa.gov/about-the-legislature/committees/${committee.Agency.toLowerCase()}/`
    : "https://leg.wa.gov/about-the-legislature/committees/";

  return (committee &&
    <>
      <Card sx={{ mx: { xs: 1, md: 3 }, my: { xs: 2, md: 3 } }}>
        <CardContent>
          <Box
            component={RouterLink}
            to="/committees"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              textDecoration: "none",
              mb: 4,
              fontSize: 18
            }}
          >
            <LeftOutlined aria-hidden />
            Back to all Committees
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
              mb: 2.5
            }}
          >
            <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 700 }}>
              {getPageTitle(committee)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                size="small"
                placeholder="Search"
                aria-label={value === 0 ? "Search committee bills" : "Search committee members"}
                sx={{ width: { xs: "100%", sm: 260 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Tooltip title="Open committee directory">
                <IconButton
                  color="primary"
                  onClick={() => window.open(externalUrl, "_blank", "noopener")}
                  aria-label="Open committee directory"
                >
                  <ExpandAltOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton
                  color="primary"
                  onClick={() => setRefreshKey((current) => current + 1)}
                  aria-label="Refresh committee data"
                >
                  <ReloadOutlined />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="committee detail tabs">
              <Tab label="Bills" {...a11yProps(0)} />
              <Tab label="Members" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <InCommitteeGrid
              committee={committee}
              search={search}
              refreshKey={refreshKey}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <MembersGrid committee={committee} search={search} />
          </CustomTabPanel>
        </CardContent>
      </Card>
    </>
  );
};

export default CommitteePage;
