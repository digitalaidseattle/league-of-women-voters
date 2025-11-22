/**
 *  CommitteePage/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { Box, Card, CardContent, CardHeader, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { useSearchParams } from "react-router-dom";
import MembersGrid from './MembersGrid';
import ReferralsGrid from './ReferralsGrid';
import { useState } from 'react';
// project import

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CommitteePage = () => {
  const [searchParams] = useSearchParams();
  const committeeName = searchParams.get("committeeName")!;
  const agency = searchParams.get("agency")!;
  const [value, setValue] = useState(0);

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

  return (
    <Card>
      <CardHeader title={`${agency}: ${committeeName}`} />
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Members" {...a11yProps(0)} />
            <Tab label="Referrals" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <MembersGrid agency={agency} committeeName={committeeName} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <ReferralsGrid agency={agency} committeeName={committeeName} />
        </CustomTabPanel>
      </CardContent>
    </Card>
  )
};

export default CommitteePage;
