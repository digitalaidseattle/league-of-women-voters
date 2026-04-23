import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useState } from "react";
import { BillDao } from "../api/billDao";
import { CommitteeDao } from "../api/committeeDao";
import { CommitteesDB } from "../api/database/CommitteesDB";
import { SponsorsDB } from "../api/database/SponsorsDB";
import { LegislatorDao } from "../api/legislatorDao";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { BillsDB } from "../api/database/BillsDB";

// project import

// ==============================|| SAMPLE PAGE ||============================== //

export const AdminPage = () => {
    const [loading, setLoading] = useState(false);
    const notify = useNotifications();

    function loadLegislators(): void {
        setLoading(true);
        LegislatorDao.getInstance()
            .getAll()
            .then(legislators => SponsorsDB.getInstance().upsert(legislators))
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
        CommitteeDao.getInstance()
            .getAll()
            .then(committees => CommitteesDB.getInstance().upsert(committees))
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
        BillDao.getInstance()
            .getBills()
            .then(bills => BillsDB.getInstance().upsert(bills))
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
                        .getBillSponsors(bill.Id)
                        .then(async sponsors => {
                            const updated = {
                                ...bill,
                                Sponsors: sponsors
                            }
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
                        .getCommitteeMembers(committee.Agency, committee.Name)
                        .then(async members => {
                            const updated = {
                                ...committee,
                                Members: members
                            }
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
        throw new Error('not implemented yet');

        // const prompt = "Parse the provided page and find the Address and Legislative assisant. Return the results in structure JSON";
        // setLoading(true);
        // SponsorsDB.getInstance()
        //     .getAll()
        //     .then(async sponsors => {

        //         for (const sponsor of sponsors) {
        //             const url = `https://leg.wa.gov/legislators/member/${sponsor.FirstName}-${sponsor.LastName}`

        //             const pageText = await HtmlDao.getInstance()
        //                 .getHtml(url)

        //             const context: ProjectContext = {
        //                 type: 'text',
        //                 name: 'website',
        //                 value: pageText,
        //                 tokenCount: 0,
        //             }
        //             const project: Project = {
        //                 name: 'chair-query',
        //                 rating: 5,
        //                 tags: [],
        //                 template: '',
        //                 prompt: prompt,
        //                 contexts: [context],
        //                 outputs: [{ name: 'Address' }, { name: 'LegislativeAssistant' }],
        //                 tokenCount: 0,
        //                 modelType: 'gemini-2.5-flash-lite',
        //             }

        //             try {
        //                 FirebaseAiService.getInstance()
        //                     .parameterizedQuery(project, 'gemini-2.5-flash-lite')
        //                     .then(async result => {
        //                         const info = JSON.parse(await result.response.text());
        //                         console.log(info)
        //                         const address = info["address"] ?? info['Address'];
        //                         const assistant = info["legislative_assistant"] ?? JSON.stringify(info['Legislative_assistant']);

        //                         const updated: DBSponsor = {
        //                             ...dbSponsor,
        //                             sponsor: {
        //                                 ...sponsor,
        //                                 Address: address,
        //                                 assistant: assistant
        //                             }
        //                         };
        //                         console.log(updated);
        //                         await SponsorsDB.getInstance()
        //                             .upsert(updated);
        //                     })
        //             } catch (err) {
        //                 throw err;
        //             }

        //         }
        //     })
        //     .catch(error => {
        //         console.log(error);
        //         notify.error('Failed to load.')
        //     })
        //     .finally(() => {
        //         setLoading(false)
        //         notify.success('Loaded committe members.')
        //     });
    }

    async function scrapeCommitteInfo(): Promise<void> {
        throw new Error('not implemented yet');

        // const prompt = "Parse the provided page and list the committee leadership in structured JSON";


        // // setLoading(true);
        // CommitteesDB.getInstance()
        //     .getAll()
        //     .then(async dbCommittees => {

        //         for (const committee of dbCommittees) {
        //             const url = committee.Agency === 'House'
        //                 ? `https://leg.wa.gov/about-the-legislature/committees/house-of-representatives/${committee.committee.Acronym}`
        //                 : committee.Agency === 'Senate'
        //                     ? `https://leg.wa.gov/about-the-legislature/committees/senate/${committee.committee.Acronym}`
        //                     : `https://leg.wa.gov/about-the-legislature/committees/joint/${committee.committee.Acronym}`

        //             const pageText = await HtmlDao.getInstance()
        //                 .getHtml(url)

        //             const context: ProjectContext = {
        //                 type: 'text',
        //                 name: 'website',
        //                 value: pageText,
        //                 tokenCount: 0,
        //             }
        //             const project: Project = {
        //                 name: 'chair-query',
        //                 rating: 5,
        //                 tags: [],
        //                 template: '',
        //                 prompt: prompt,
        //                 contexts: [context],
        //                 outputs: [{ name: 'Chair' }, { name: 'Vice Chair' }, { name: 'Ranking Member' }],
        //                 tokenCount: 0,
        //                 modelType: 'gemini-2.5-flash-lite',
        //             }

        //             FirebaseAiService.getInstance()
        //                 .parameterizedQuery(project, 'gemini-2.5-flash-lite')
        //                 .then(async result => {
        //                     console.log('***AI response**', committee.Acronym, result.response.text());
        //                 })
        //         }
        //     })
        //     .catch(error => {
        //         console.log(error);
        //         notify.error('Failed to load.')
        //     })
        //     .finally(() => {
        //         setLoading(false)
        //         notify.success('Loaded committe members.')
        //     });
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