import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from "react";

// project import

// Kept outside the component so running jobs survive leaving and returning to this page
const runningJobs = new Set<string>();
const runningListeners = new Set<() => void>();

function setJobRunning(job: string, isRunning: boolean) {
    if (isRunning) {
        runningJobs.add(job);
    } else {
        runningJobs.delete(job);
    }
    runningListeners.forEach(listener => listener());
}

// ==============================|| SAMPLE PAGE ||============================== //
// const gemini_model = 'gemini-2.5-flash-lite';

export const AdminPage = () => {
    // Jobs currently running. Only their buttons are disabled, so the rest of the app stays usable.
    const [running, setRunning] = useState<string[]>(() => [...runningJobs]);
    const notify = useNotifications();

    useEffect(() => {
        const update = () => setRunning([...runningJobs]);
        runningListeners.add(update);
        return () => {
            runningListeners.delete(update);
        };
    }, []);

    function start(job: string) {
        setJobRunning(job, true);
    }

    function finish(job: string) {
        setJobRunning(job, false);
    }

    function jobButtonProps(job: string) {
        const isRunning = running.includes(job);
        return {
            disabled: isRunning,
            startIcon: isRunning ? <CircularProgress size={16} /> : undefined
        };
    }


    async function legislatorJob(): Promise<void> {
        start('legislatorJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislator-services");
            if (error) throw error;
            notify.success(`Load legislators: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('legislatorJob')
        }
    }

    async function legislatorInfoJob(): Promise<void> {
        start('legislatorInfoJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislator-info-service");
            if (error) throw error;
            notify.success(`Load legislator info: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('legislatorInfoJob')
        }
    }

    async function loadCommitteMembersJob(): Promise<void> {
        start('loadCommitteMembersJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-membership-service");
            if (error) throw error;
            notify.success(`Load committee members: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('loadCommitteMembersJob')
        }
    }


    async function loadCommitteesJob(): Promise<void> {
        start('loadCommitteesJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-info-service");
            if (error) throw error;
            notify.success(`Load committees: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('loadCommitteesJob')
        }
    }

    async function committeeLeadershipJob(): Promise<void> {
        start('committeeLeadershipJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-leadership-service");
            if (error) throw error;
            notify.success(`Load committee leadership: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('committeeLeadershipJob')
        }
    }

    async function committeeReferralJob(): Promise<void> {
        start('committeeReferralJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-referral-service");
            if (error) throw error;
            notify.success(`Load committee referrals: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('committeeReferralJob')
        }
    }

    async function committeeInCommitteeJob(): Promise<void> {
        start('committeeInCommitteeJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("committee-incommittee-service");
            if (error) throw error;
            notify.success(`Load committee in-committee information: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('committeeInCommitteeJob')
        }
    }

    async function billInfoCachingJob(): Promise<void> {
        start('billInfoCachingJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-info-service", {
                    body: { year: 2026 },
                });
            if (error) throw error;
            notify.success(`Load bills: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('billInfoCachingJob')
        }
    }

    async function billDetailCachingJob(): Promise<void> {
        start('billDetailCachingJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-detail-service");
            if (error) throw error;
            notify.success(`Load bill details: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('billDetailCachingJob')
        }
    }

    async function billCommitteeCachingJob(): Promise<void> {
        start('billCommitteeCachingJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-committee-service");
            if (error) throw error;
            notify.success(`Load bill committees: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('billCommitteeCachingJob')
        }
    }

    async function billSponsorsCachingJob(): Promise<void> {
        start('billSponsorsCachingJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-sponsors-service");
            if (error) throw error;
            notify.success(`Load bill sponsors: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('billSponsorsCachingJob')
        }
    }

    async function billHearingsCachingJob(): Promise<void> {
        start('billHearingsCachingJob');
        try {
            const { data, error } = await SupabaseConfiguration.getInstance()
                .getSupabaseClient().functions
                .invoke("legislation-hearings-service");
            if (error) throw error;
            notify.success(`Load bill hearings: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
        }
        finally {
            finish('billHearingsCachingJob')
        }
    }

    return (<>
        <Breadcrumbs aria-label="breadcrumb">
            <NavLink to="/" ><IconButton size="medium"><HomeOutlined /></IconButton></NavLink>
            <Typography color="text.primary">Admin</Typography>
        </Breadcrumbs>
        <Card>
            <CardHeader title={'Admin'} />
            <CardContent>
                <Stack>
                    <Button onClick={legislatorJob} {...jobButtonProps('legislatorJob')}>Edge load Legislators</Button>
                    <Button onClick={legislatorInfoJob} {...jobButtonProps('legislatorInfoJob')}>Edge load Legislator Info</Button>
                    <hr />
                    <Button onClick={loadCommitteesJob} {...jobButtonProps('loadCommitteesJob')}>Edge Load Committees</Button>
                    <Button onClick={loadCommitteMembersJob} {...jobButtonProps('loadCommitteMembersJob')}>Edge Load Committee Members</Button>
                    <Button onClick={committeeLeadershipJob} {...jobButtonProps('committeeLeadershipJob')}>Edge Load Committee Leadership</Button>
                    <Button onClick={committeeReferralJob} {...jobButtonProps('committeeReferralJob')}>Edge Load Committee Referrals</Button>
                    <Button onClick={committeeInCommitteeJob} {...jobButtonProps('committeeInCommitteeJob')}>Edge Load Committee In-Committee</Button>
                    <hr />
                    <Button onClick={billInfoCachingJob} {...jobButtonProps('billInfoCachingJob')}>Edge load Bills</Button>
                    <Button onClick={billDetailCachingJob} {...jobButtonProps('billDetailCachingJob')}>Edge load Bill Details</Button>
                    <Button onClick={billCommitteeCachingJob} {...jobButtonProps('billCommitteeCachingJob')}>Edge load Bill Committee</Button>
                    <Button onClick={billSponsorsCachingJob} {...jobButtonProps('billSponsorsCachingJob')}>Edge load Bill Sponsors</Button>
                    <Button onClick={billHearingsCachingJob} {...jobButtonProps('billHearingsCachingJob')}>Edge load Bill Hearings</Button>
                </Stack>
            </CardContent>
        </Card>
    </>
    )
};