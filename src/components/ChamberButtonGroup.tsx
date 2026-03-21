/**
*  ChamberButtonGroup.tsx
*
*  @copyright 2025 Digital Aid Seattle
*
*/
import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';

const CHAMBER_TABS = [
    { label: "All", value: "all" },
    { label: "House", value: "house" },
    { label: "Senate", value: "senate" },
    { label: "Joint", value: "joint" }
] as const;

export function ChamberButtonGroup({ chamber, onChange }: { chamber: string, onChange: (value: string) => void }) {
    const [tab, setTab] = useState<string>('all');

    useEffect(() => {
        setTab(chamber ?? 'all')
    }, [chamber]);

    function handleChange(value: string): void {
        setTab(value);
        onChange(value);
    }

    return (
        <Box sx={{ marginTop: 1, flexGrow: 1 }}>
            <Tabs
                value={tab}
                onChange={(_event, value: string) => handleChange(value)}
                aria-label="bill chamber filter"
                sx={{ mb: 2 }}
            >
                {CHAMBER_TABS.map((tabOption) => (
                    <Tab key={tabOption.value} label={tabOption.label} value={tabOption.value} />
                ))}
            </Tabs>
        </Box>
    )
}