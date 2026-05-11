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
import { LegislatorDao } from "../api/legislatorDao";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";

// project import

// ==============================|| SAMPLE PAGE ||============================== //
// const gemini_model = 'gemini-2.5-flash-lite';

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

    async function loadBillSponsors(): Promise<void> {
        setLoading(true);
        try {
            const bills = await BillsDB.getInstance().getAll();
            for (let i = 0; i < bills.length; i++) {
                const bill = bills[i];
                const substrings = `${bill.Id}`.split(".")
                const name = substrings[0].split("-")[0]
                try {
                    BillDao.getInstance()
                        .getBillSponsors(name)
                        .then(async sponsors => {
                            const updated = {
                                ...bill,
                                Sponsors: sponsors
                            }
                            await BillsDB.getInstance()
                                .upsert(updated);
                        });
                }
                catch (error) {
                    console.log(error);
                    notify.error(`Failed to load sponsors. ${name}`);
                    throw (error);
                }
            }
            notify.success('Loaded bill sponsors.')
            console.log('Done');
        }
        finally {
            setLoading(false)
        };
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

    async function legislatorInfoJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislator-info-service")
                .then((resp: any) => resp.data);
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

    async function committeeLeadershipJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-leadership-service")
                .then((resp: any) => resp.data);
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

    async function testEdgeFunction(): Promise<void> {
        setLoading(true);
        try {
            CommitteeDao.getInstance()
                .getAll()
                .then((resp: any) => console.log(resp));
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

    async function testDBEdgeFunction(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-db-service")
                .then((resp: any) => resp.data);
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
                    <hr />
                    <Button onClick={legislatorInfoJob}>Edge load Legislator </Button>
                    <Button onClick={committeeLeadershipJob}>Edge load Committee Leadership</Button>
                    <hr />
                    <Button onClick={testEdgeFunction}>Test Fetch Committees</Button>
                    <Button onClick={testDBEdgeFunction}>Test Fetch Committees (DB)</Button>
                </Stack>
            </CardContent>
        </Card>

    </>
    )
};