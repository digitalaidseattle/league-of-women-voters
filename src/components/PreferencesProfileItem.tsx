import { useContext, useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { UserContext } from "@digitalaidseattle/core";
import { DBPreference, PreferencesDB } from "../api/database/PreferencesDB";

/**
 * Rendered inside the profile popover (via LayoutConfiguration.profileItems).
 * Shows the signed-in user's current biennium and their list of favorite bills.
 * The bills list is empty by default; favoriting bills is a later feature.
 */
export const PreferencesProfileItem = () => {
    const { user } = useContext(UserContext);
    const [preference, setPreference] = useState<DBPreference | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }
        let active = true;
        PreferencesDB.getInstance()
            .getOrCreateMyPreference()
            .then((pref) => { if (active) setPreference(pref); })
            .catch((err) => { if (active) setError(err.message); });
        return () => { active = false; };
    }, [user]);

    if (error) {
        return (
            <Typography variant="body2" color="error">
                Could not load preferences
            </Typography>
        );
    }

    if (!preference) {
        return (
            <Typography variant="body2" color="text.secondary">
                Loading preferences…
            </Typography>
        );
    }

    const bills = preference.bills ?? [];

    return (
        <Box sx={{ width: "100%" }}>
            <Stack spacing={0.5}>
                <Typography variant="body2">
                    <strong>Biennium:</strong> {preference.biennium || "—"}
                </Typography>
                <Box>
                    <Typography variant="body2"><strong>Bills:</strong></Typography>
                    {bills.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                            No favorite bills yet
                        </Typography>
                    ) : (
                        <Box component="ul" sx={{ m: 0, pl: 3 }}>
                            {bills.map((billId) => (
                                <li key={billId}>
                                    <Typography variant="body2">{billId}</Typography>
                                </li>
                            ))}
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};
