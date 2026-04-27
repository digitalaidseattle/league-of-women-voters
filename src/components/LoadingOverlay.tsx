/**
* LoadingOverlay.tsx
* 
* @copyright 2026 Digital Aid Seattle
*/
import React from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export const LoadingOverlay = ({ loading, message }: { loading: boolean, message?: string }) => {

    return (loading &&
        <React.Fragment>
            <Box
                sx={{
                    position: "fixed",
                    inset: 0, // top:0, right:0, bottom:0, left:0
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",

                    backgroundColor: "rgba(255, 255, 255, 0.5)", // transparent white overlay
                    backdropFilter: "blur(2px)",                 // optional: subtle blur
                    zIndex: 2000,                                // above most content
                }}
            >
                <Stack sx={{
                    display: 'flex',
                    alignItems: 'center', // Aligns children vertically in a row direction
                    justifyContent: 'center',
                    gap: 5
                }}>
                    <CircularProgress size={100} />
                    <Typography>{message}</Typography>
                </Stack>
            </Box>
        </React.Fragment>
    )
}