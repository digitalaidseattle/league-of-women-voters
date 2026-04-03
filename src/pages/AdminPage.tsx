import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useState } from "react";
import { BillDao } from "../api/billDao";
import { BillService } from "../api/billService";
import { CommitteeDao } from "../api/committeeDao";
import { FirebaseAiService, Project, ProjectContext } from "../api/content-generation/FirebaseAiService";
import { BillsDB } from "../api/database/BillsDB";
import { CommitteesDB } from "../api/database/CommitteesDB";
import { DBSponsor, SponsorsDB } from "../api/database/SponsorsDB";
import { LegislatorService } from "../api/legislatorService";
import { LegislatureService } from "../api/legislatureService";
import { PassThruDao } from "../api/passThruDao";
import { LoadingOverlay } from "../components/LoadingOverlay";

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

  async function scrapeLegislatorInfo(): Promise<void> {

    const prompt = "Parse the provided page and find the Address and Legislative assisant. Return the results in structure JSON";
    setLoading(true);
    SponsorsDB.getInstance()
      .getAll()
      .then(async dbSponsors => {

        for (const dbSponsor of dbSponsors) {
          const sponsor = dbSponsor.sponsor;
          const url = `https://leg.wa.gov/legislators/member/${sponsor.FirstName}-${sponsor.LastName}`

          const pageText = await PassThruDao.getInstance()
            .getHtml(url)

          const context: ProjectContext = {
            type: 'text',
            name: 'website',
            value: pageText,
            tokenCount: 0,
          }
          const project: Project = {
            name: 'chair-query',
            rating: 5,
            tags: [],
            template: '',
            prompt: prompt,
            contexts: [context],
            outputs: [{ name: 'Address' }, { name: 'LegislativeAssistant' }],
            tokenCount: 0,
            modelType: 'gemini-2.5-flash-lite',
          }

          try {
            FirebaseAiService.getInstance()
              .parameterizedQuery(project, 'gemini-2.5-flash-lite')
              .then(async result => {
                const info = JSON.parse(await result.response.text());
                console.log(info)
                const address = info["address"] ?? info['Address'];
                const assistant = info["legislative_assistant"] ?? JSON.stringify(info['Legislative_assistant']);

                const updated: DBSponsor = {
                  ...dbSponsor,
                  sponsor: {
                    ...sponsor,
                    Address: address,
                    assistant: assistant
                  }
                };
                console.log(updated);
                await SponsorsDB.getInstance()
                  .upsert(updated);
              })
          } catch (err) {
            throw err;
          }

        }
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        setLoading(false)
        notify.success('Loaded committe members.')
      });
  }

  async function scrapeCommitteInfo(): Promise<void> {

    const prompt = "Parse the provided page and list the committee leadership in structured JSON";


    // setLoading(true);
    CommitteesDB.getInstance()
      .getAll()
      .then(async dbCommittees => {

        for (const committee of dbCommittees) {
          const url = committee.committee.Agency === 'House'
            ? `https://leg.wa.gov/about-the-legislature/committees/house-of-representatives/${committee.committee.Acronym}`
            : committee.committee.Agency === 'Senate'
              ? `https://leg.wa.gov/about-the-legislature/committees/senate/${committee.committee.Acronym}`
              : `https://leg.wa.gov/about-the-legislature/committees/joint/${committee.committee.Acronym}`

          const pageText = await PassThruDao.getInstance()
            .getHtml(url)

          const context: ProjectContext = {
            type: 'text',
            name: 'website',
            value: pageText,
            tokenCount: 0,
          }
          const project: Project = {
            name: 'chair-query',
            rating: 5,
            tags: [],
            template: '',
            prompt: prompt,
            contexts: [context],
            outputs: [{ name: 'Chair' }, { name: 'Vice Chair' }, { name: 'Ranking Member' }],
            tokenCount: 0,
            modelType: 'gemini-2.5-flash-lite',
          }

          FirebaseAiService.getInstance()
            .parameterizedQuery(project, 'gemini-2.5-flash-lite')
            .then(async result => {
              console.log('***AI response**', committee.committee.Acronym, result.response.text());
            })
        }
      })
      .catch(error => {
        console.log(error);
        notify.error('Failed to load.')
      })
      .finally(() => {
        setLoading(false)
        notify.success('Loaded committe members.')
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
          <Button onClick={scrapeLegislatorInfo}>Scrape Legislator Info</Button>
          <Button onClick={scrapeCommitteInfo}>Scrape Committee Info</Button>
        </Stack>
      </CardContent>
    </Card>

  </>
  )
};
