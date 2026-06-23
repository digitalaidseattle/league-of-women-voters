import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useState } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";

// project import

// ==============================|| SAMPLE PAGE ||============================== //
// const gemini_model = 'gemini-2.5-flash-lite';

export const AdminPage = () => {
    const [loading, setLoading] = useState(false);
    const notify = useNotifications();

    async function legislatorJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislator-services", {
                    body: { biennium: "2025-26" },
                })
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded legislators.')
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

    async function loadCommitteMembersJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-membership-service", {
                    body: { biennium: "2025-26" },
                })
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


    async function loadCommitteesJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-info-service")
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded committees.')
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
            notify.success('Loaded committee members.')
            setLoading(false)
        };
    }

    async function committeeReferralJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-referral-service", {
                    body: { biennium: "2025-26" },
                })
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded committee referrals.')
            setLoading(false)
        };
    }

    async function committeeInCommitteeJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-incommittee-service", {
                    body: { biennium: "2025-26" },
                })
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded committee in-committee information.')
            setLoading(false)
        };
    }

    async function billInfoCachingJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-info-service", {
                    body: { year: 2026 },
                })
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

    async function billDetailCachingJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-detail-service")
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded bill details.')
            setLoading(false)
        };
    }

    async function billCommitteeCachingJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-committee-service", {
                    body: { biennium: "2025-26" },
                })
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

    async function billSponsorsCachingJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-sponsors-service", {
                    body: { biennium: "2025-26" },
                })
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded bill sponsors.')
            setLoading(false)
        };
    }

    async function billHearingsCachingJob(): Promise<void> {
        setLoading(true);
        try {
            SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-hearings-service", {
                    body: { biennium: "2025-26" },
                })
                .then((resp: any) => resp.data);
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            notify.success('Loaded bill hearings.')
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
                    <Button onClick={legislatorJob}>Edge load Legislators</Button>
                    <Button onClick={legislatorInfoJob}>Edge load Legislator Info</Button>
                    <hr />
                    <Button onClick={loadCommitteesJob}>Edge Load Committees</Button>
                    <Button onClick={loadCommitteMembersJob}>Edge Load Committee Members</Button>
                    <Button onClick={committeeLeadershipJob}>Edge Load Committee Leadership</Button>
                    <Button onClick={committeeReferralJob}>Edge Load Committee Referrals</Button>
                    <Button onClick={committeeInCommitteeJob}>Edge Load Committee In-Committee</Button>
                    <hr />
                    <Button onClick={billInfoCachingJob}>Edge load Bills</Button>
                    <Button onClick={billDetailCachingJob}>Edge load Bill Details</Button>
                    <Button onClick={billCommitteeCachingJob}>Edge load Bill Committee</Button>
                    <Button onClick={billSponsorsCachingJob}>Edge load Bill Sponsors</Button>
                    <Button onClick={billHearingsCachingJob}>Edge load Bill Hearings</Button>
                </Stack>
            </CardContent>
        </Card>
    </>
    )
};