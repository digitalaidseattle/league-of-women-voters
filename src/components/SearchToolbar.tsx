/**
*  SearchToolbar.tsx
*
*  DataGrid toolbar slot with chamber tabs, search, export and refresh.
*  Pass page state through `slotProps.toolbar`.
*
*  @copyright 2026 Digital Aid Seattle
*
*/
import { ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import { IconButton, Tooltip } from "@mui/material";
import { Toolbar, ToolbarPropsOverrides } from "@mui/x-data-grid";
import { ReactNode } from "react";
import { CHAMBER_TYPE, ChamberButtonGroup } from "./ChamberButtonGroup";
import { SearchField } from "./SearchField";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        chamber: CHAMBER_TYPE;
        onChamberChange: (value: CHAMBER_TYPE) => void;
        search: string;
        onSearchChange: (value: string) => void;
        onExport: () => void;
        onRefresh: () => void;
        actions?: ReactNode;
    }
}

export function SearchToolbar({ chamber, onChamberChange, search, onSearchChange, onExport, onRefresh, actions }: ToolbarPropsOverrides) {
    return (
        <Toolbar>
            <ChamberButtonGroup chamber={chamber} onChange={onChamberChange} />
            <SearchField value={search} onChange={onSearchChange} />
            {actions}
            <Tooltip title="Export">
                <IconButton color="primary" size="small" onClick={onExport} aria-label="Export">
                    <ExportOutlined />
                </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
                <IconButton color="primary" size="small" onClick={onRefresh} aria-label="Refresh">
                    <ReloadOutlined />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}
