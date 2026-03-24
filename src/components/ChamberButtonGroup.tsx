/**
*  ChamberButtonGroup.tsx
*
*  @copyright 2025 Digital Aid Seattle
*
*/
import { Box, Tab, Tabs } from '@mui/material';

const CHAMBER_TABS = [
    { label: "All", value: "all" },
    { label: "House", value: "house" },
    { label: "Senate", value: "senate" },
    { label: "Joint", value: "joint" }
] as const;

export type CHAMBER_TYPE = (typeof CHAMBER_TABS)[number]["value"];

export function ChamberButtonGroup({ chamber, onChange }: { chamber: CHAMBER_TYPE, onChange: (value: CHAMBER_TYPE) => void }) {

    function handleChange(value: CHAMBER_TYPE): void {
        onChange(value);
    }

    return (
        <Box sx={{ marginTop: 1, flexGrow: 1 }}>
            <Tabs
                value={chamber}
                onChange={(_event, value: string) => handleChange(value as CHAMBER_TYPE)}
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