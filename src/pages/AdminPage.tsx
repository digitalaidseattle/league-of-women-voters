import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useState } from "react";
import { BillDao } from "../api/billDao";
import { CommitteeDao } from "../api/committeeDao";
import { BillsDB } from "../api/database/BillsDB";
import { CommitteesDB } from "../api/database/CommitteesDB";
import { SponsorsDB } from "../api/database/SponsorsDB";
import { UpdateScheduleDB } from "../api/database/UpdateScheduleDB";
import { HtmlDao } from "../api/HtmlDao";
import { LegislatorDao } from "../api/legislatorDao";
import { FirebaseAiService, Project, ProjectContext } from "../api/screen-scraped/FirebaseAiService";
import { LoadingOverlay } from "../components/LoadingOverlay";

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

    async function loadCommitteMembers(): Promise<void> {
        setLoading(true);
        try {
            const checkDate = new Date();

            const committees = await CommitteesDB.getInstance()
                .findLastUpdateBefore(checkDate, 'membership_update');
            const now = new Date().toISOString();
            committees.forEach(async committee => {
                await CommitteeDao.getInstance()
                    .getCommitteeMembers(committee.Agency, committee.Name)
                    .then(async members => {
                        const updated = {
                            ...committee,
                            membership_update: now,
                            Members: members
                        }
                        await CommitteesDB.getInstance()
                            .updateMembership(updated);
                    })
            });
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded committe members.')
            setLoading(false)
        };
    }

    async function scrapeLegislatorInfo(): Promise<void> {

        const prompt = "Parse the provided page and find the Address and Legislative assisant. Return the results in structure JSON";
        setLoading(true);
        try {
            const checkDate = await UpdateScheduleDB.getInstance()
                .getByName('legislator_info')
                .then(sched => sched.last_update);

            const sponsors = await SponsorsDB.getInstance()
                .findLastUpdateBefore(checkDate, 'info_update');
            //for (let i = 0; i < sponsors.length; i++) {
            for (let i = 0; i <= 0; i++) {
                const sponsor = sponsors[i];
                const url = `https://leg.wa.gov/legislators/member/${sponsor.FirstName}-${sponsor.LastName}`

                const pageText = await HtmlDao.getInstance()
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
                const infoShema = {
                    type: "object",
                    properties: {
                        Address: {
                            type: "string"
                        },
                        Assistant: {
                            type: "string"
                        }
                    },
                }

                try {
                    // console.log(url, project)
                    FirebaseAiService.getInstance()
                        .parameterizedQuery(project, infoShema, 'gemini-2.5-flash-lite')
                        .then(async result => {
                            const info = JSON.parse(await result.response.text());
                            const updated: Member = {
                                ...sponsor,
                                ...info
                            };
                            await SponsorsDB.getInstance()
                                .updateInfo(updated);
                        })
                } catch (err) {
                    throw err;
                }

            }
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            setLoading(false)
            notify.success('Loaded legislator info.')
        }
    }

    async function scrapeCommitteLeadership(): Promise<void> {

        const prompt = "Parse the provided page and list the committee leaders in structured JSON";


        setLoading(true);
        try {
            const checkDate = await UpdateScheduleDB.getInstance()
                .getByName('committee_leadership')
                .then(sched => sched.last_update);

            const committees = await CommitteesDB.getInstance()
                .findLastUpdateBefore(checkDate, 'leadership_update');
            for (let i = 0; i <= 0; i++) {
                const committee = committees[i];
                const url = committee.Agency === 'House'
                    ? `https://leg.wa.gov/about-the-legislature/committees/house-of-representatives/${committee.Acronym}`
                    : committee.Agency === 'Senate'
                        ? `https://leg.wa.gov/about-the-legislature/committees/senate/${committee.Acronym}`
                        : `https://leg.wa.gov/about-the-legislature/committees/joint/${committee.Acronym}`

                const pageText = await HtmlDao.getInstance()
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
                    outputs: [
                        { name: 'Chair' },
                        { name: 'Vice Chair' },
                        { name: 'Ranking Member' }
                    ],
                    tokenCount: 0,
                    modelType: 'gemini-2.5-flash-lite',
                }

                const leadershipShema = {
                    type: "array",
                    items: [
                        {
                            type: "object",
                            properties: {
                                role: {
                                    type: "string"
                                },
                                name: {
                                    type: "string"
                                }
                            },
                            required: ["role", "name"]
                        }
                    ]
                }

                FirebaseAiService.getInstance()
                    .parameterizedQuery(project, leadershipShema, 'gemini-2.5-flash-lite')
                    .then(async result => {
                        const info = JSON.parse(await result.response.text());
                        const updated: Committee = {
                            ...committee,
                            Leadership: info
                        };
                        console.log(url, info)
                        await CommitteesDB.getInstance()
                            .updateLeadership(updated);
                    })
            }
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            setLoading(false)
            notify.success('Loaded committe members.')
        };
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
                    <Button onClick={scrapeCommitteLeadership}>Scrape Committee Leadership</Button>
                </Stack>
            </CardContent>
        </Card>

    </>
    )
};