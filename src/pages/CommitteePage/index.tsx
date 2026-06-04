/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ExpandAltOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Box, Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";
import { Committee } from "../../api/committee";
import { LegislatureService } from "../../api/legislatureService";
import { SearchField } from "../../components/SearchField";
import { getCommitteePageTitle } from "../../utils/committees";
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

  const externalUrl = committee
    ? `https://leg.wa.gov/about-the-legislature/committees/${committee.Agency.toLowerCase()}/`
    : "https://leg.wa.gov/about-the-legislature/committees/";

  return (committee &&
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/committees" >Committees</NavLink>
        <Typography color="text.primary">Committee Detail</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          title={getCommitteePageTitle(committee)}
          action={
            <>
              <SearchField value={search} onChange={(value) => setSearch(value)} />
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
            </>
          }
        />
        <CardContent>
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
