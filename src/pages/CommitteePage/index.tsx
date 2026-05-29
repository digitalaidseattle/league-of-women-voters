/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { HomeOutlined } from "@ant-design/icons";
import { Box, Breadcrumbs, Card, CardContent, CardHeader, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router-dom";

import { LegislatureService } from "../../api/legislatureService";
import MembersGrid from './MembersGrid';
import ReferralsGrid from './ReferralsGrid';
import InCommitteeGrid from "./InCommitteeGrid";
import { Committee } from "../../api/committee";
// project import

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CommitteePage = () => {
  const { id } = useParams<string>();

  const [value, setValue] = useState(0);
  const [committee, setCommittee] = useState<Committee>();

  useEffect(() => {
    if (id) {
      LegislatureService.getInstance()
        .getById(id)
        .then(cc => setCommittee(cc))
    }
  }, [id]);

  useEffect(() => {
    console.log(committee)
  }, [committee]);

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
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  return (committee &&
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
        <NavLink to="/committees" >Committees</NavLink>
        <Typography color="text.primary">Committee Detail</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader title={`${committee?.Agency}: ${committee?.Name}`} />
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Bills (In Committee)" {...a11yProps(0)} />
              <Tab label="Members" {...a11yProps(1)} />
              <Tab label="Bills" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <InCommitteeGrid committee={committee} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <MembersGrid committee={committee!} />
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            <ReferralsGrid committee={committee} />
          </CustomTabPanel>
        </CardContent>
      </Card>
    </>
  )
};

export default CommitteePage;
