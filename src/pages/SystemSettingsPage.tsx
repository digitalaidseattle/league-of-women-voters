import { NavLink } from "react-router-dom";

// material-ui
import { HomeOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import {
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { DBPreference, PreferencesDB } from "../api/database/PreferencesDB";
import { LoadingOverlay } from "../components/LoadingOverlay";

// ==============================|| SYSTEM SETTINGS PAGE ||============================== //

export const SystemSettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [preference, setPreference] = useState<DBPreference | null>(null);
    const [biennium, setBiennium] = useState("");
    const notify = useNotifications();
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) {
            return;
        }
        loadedRef.current = true;
        setLoading(true);
        PreferencesDB.getInstance()
            .getCurrentPreference()
            .then((pref) => {
                setPreference(pref);
                setBiennium(pref.biennium ?? "");
            })
            .catch((err) => notify.error(err.message))
            .finally(() => setLoading(false));
    }, [notify]);

    async function save(): Promise<void> {
        if (!preference) {
            return;
        }
        setLoading(true);
        try {
            const updated = await PreferencesDB.getInstance().updateBiennium(
                preference.id,
                biennium.trim()
            );
            setPreference(updated);
            setBiennium(updated.biennium ?? "");
            notify.success("Saved biennium.");
        } catch (error) {
            notify.error(error instanceof Error ? error.message : "Failed to save.");
        } finally {
            setLoading(false);
        }
    }

    const dirty = !!preference && biennium.trim() !== (preference.biennium ?? "");

    return (
        <>
            <LoadingOverlay loading={loading} />
            <Breadcrumbs aria-label="breadcrumb">
                <NavLink to="/">
                    <IconButton size="medium">
                        <HomeOutlined />
                    </IconButton>
                </NavLink>
                <Typography color="text.primary">System Settings</Typography>
            </Breadcrumbs>
            <Card>
                <CardHeader title={"System Settings"} />
                <CardContent>
                    <Stack spacing={2} sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" color="text.secondary">
                            The current biennium applies to the whole application. Changing it
                            here updates it for all users without a redeploy.
                        </Typography>
                        <TextField
                            label="Current biennium"
                            value={biennium}
                            onChange={(e) => setBiennium(e.target.value)}
                            placeholder="2025-26"
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={save}
                            disabled={!dirty || loading}
                        >
                            Save
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
};
