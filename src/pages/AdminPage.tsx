import { Fragment } from "react";
import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, CircularProgress, IconButton, Stack, Typography } from '@mui/material';

// project import
import { runEdgeJob, useRunningJobs } from "../utils/edgeJobs";

type EdgeJob = {
    functionName: string;
    label: string;
    buttonText: string;
    body?: Record<string, unknown>;
};

// Each group is separated by a divider on the page
const JOB_GROUPS: EdgeJob[][] = [
    [
        { functionName: "legislator-services", label: "Load legislators", buttonText: "Edge load Legislators" },
        { functionName: "legislator-info-service", label: "Load legislator info", buttonText: "Edge load Legislator Info" },
    ],
    [
        { functionName: "committee-info-service", label: "Load committees", buttonText: "Edge Load Committees" },
        { functionName: "committee-membership-service", label: "Load committee members", buttonText: "Edge Load Committee Members" },
        { functionName: "committee-leadership-service", label: "Load committee leadership", buttonText: "Edge Load Committee Leadership" },
        { functionName: "committee-referral-service", label: "Load committee referrals", buttonText: "Edge Load Committee Referrals" },
        { functionName: "committee-incommittee-service", label: "Load committee in-committee information", buttonText: "Edge Load Committee In-Committee" },
    ],
    [
        { functionName: "legislation-info-service", label: "Load bills", buttonText: "Edge load Bills", body: { year: 2026 } },
        { functionName: "legislation-detail-service", label: "Load bill details", buttonText: "Edge load Bill Details" },
        { functionName: "legislation-committee-service", label: "Load bill committees", buttonText: "Edge load Bill Committee" },
        { functionName: "legislation-sponsors-service", label: "Load bill sponsors", buttonText: "Edge load Bill Sponsors" },
        { functionName: "legislation-hearings-service", label: "Load bill hearings", buttonText: "Edge load Bill Hearings" },
    ],
];

// ==============================|| ADMIN PAGE ||============================== //

export const AdminPage = () => {
    // Only the running job's button is disabled, so the rest of the app stays usable
    const running = useRunningJobs();
    const notify = useNotifications();

    async function runJob(job: EdgeJob): Promise<void> {
        try {
            const data = await runEdgeJob(job.functionName, job.body);
            notify.success(`${job.label}: ${data}`)
        }
        catch (error) {
            console.log(error);
            notify.error('Failed to load.')
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
                    {JOB_GROUPS.map((group, index) => (
                        <Fragment key={index}>
                            {index > 0 && <hr />}
                            {group.map(job => {
                                const isRunning = running.includes(job.functionName);
                                return (
                                    <Button
                                        key={job.functionName}
                                        onClick={() => runJob(job)}
                                        disabled={isRunning}
                                        startIcon={isRunning ? <CircularProgress size={16} /> : undefined}
                                    >
                                        {job.buttonText}
                                    </Button>
                                );
                            })}
                        </Fragment>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    </>
    )
};
