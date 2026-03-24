import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useState } from "react";
import { SponsorsDB } from "../api/database/SponsorsDB";
import { LegislatorService } from "../api/legislatorService";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useNotifications } from "@digitalaidseattle/core";
import { LegislatureService } from "../api/legislatureService";
import { CommitteesDB } from "../api/database/CommitteesDB";
import { BillService } from "../api/billService";
import { BillsDB } from "../api/database/BillsDB";
import { BillDao } from "../api/billDao";
import { CommitteeDao } from "../api/committeeDao";

// project import

// ==============================|| SAMPLE PAGE ||============================== //

export const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const notify = useNotifications();


  function loadLegislators(): void {
    setLoading(true);
    LegislatorService.getInstance()
      .getAll()
      .then(legislators => {
        const dbSponsors = legislators.map(legislator => ({
          id: legislator.Id,
          sponsor: legislator
        }));
        // there are duplicate IDs !!??
        for (const dbSponsor of dbSponsors) {
          SponsorsDB.getInstance()
            .upsert(dbSponsor)
        }
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        notify.success('Loaded committees.')
        setLoading(false)
      });
  }

  function loadCommittees(): void {
    setLoading(true);
    LegislatureService.getInstance()
      .getCommittees()
      .then(committees => {
        const dbCommittees = committees.map(committee => ({
          id: committee.Id,
          committee: committee
        }));
        CommitteesDB.getInstance()
          .upsert(dbCommittees)
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        notify.success('Loaded legislators.')
        setLoading(false)
      });
  }

  function loadBills(): void {
    setLoading(true);
    BillService.getInstance()
      .getAll()
      .then(bills => {
        const dbBills = bills.map(bill => ({
          id: bill.Name!,
          bill: bill
        }));
        BillsDB.getInstance()
          .upsert(dbBills)
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        notify.success('Loaded bills.')
        setLoading(false)
      });
  }

  function loadBillSponsors(): void {
    setLoading(true);
    BillsDB.getInstance()
      .getAll()
      .then(bills => {
        bills.forEach(bill =>
          BillDao.getInstance()
            .getBillSponsors(bill.bill.BillId)
            .then(async sponsors => {
              const updated = { ...bill, bill: { ...bill.bill, Sponsors: sponsors } }
              await BillsDB.getInstance()
                .upsert(updated);
            }));
        console.log('done')
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        notify.success('Loaded bill sponsors.')
        setLoading(false)
      });
  }

  function loadCommitteMembers(): void {
    setLoading(true);
    CommitteesDB.getInstance()
      .getAll()
      .then(async dbCommittees => {
        dbCommittees.forEach(async committee => {
          await CommitteeDao.getInstance()
            .getCommitteeMembers(committee.committee.Agency, committee.committee.Name)
            .then(async members => {
              const updated = { ...committee, committee: { ...committee.committee, Members: members } }
              console.log(updated)

              await CommitteesDB.getInstance()
                .upsert(updated);
            })
        });
        console.log('done')
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        notify.success('Loaded committe members.')
        setLoading(false)
      });
  }


  return (<>
    <LoadingOverlay loading={loading} />
    <Breadcrumbs aria-label="breadcrumb">
      <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
      <Typography color="text.primary">Admin</Typography>
    </Breadcrumbs>
    <Card>
      <CardHeader title={'Admin'} />
      <CardContent>
        <Stack>
          <Button onClick={loadLegislators}>Load Legislators</Button>
          <Button onClick={loadCommittees}>Load Committees</Button>
          <Button onClick={loadBills}>Load Bills</Button>
          <Button onClick={loadBillSponsors}>Load Bill Sponsors</Button>
          <Button onClick={loadCommitteMembers}>Load Committee Members</Button>
        </Stack>
      </CardContent>
    </Card>

  </>
  )
};
