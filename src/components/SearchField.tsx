/**
*  SearchField.tsx
*
*  @copyright 2026 Digital Aid Seattle
*
*/
import {
    SearchOutlined
} from "@ant-design/icons";
import { useDebounce } from "@digitalaidseattle/mui";
import {
    InputAdornment,
    TextField
} from "@mui/material";
import { useEffect, useState } from "react";

export function SearchField({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    const [inner, setInner] = useState(value);
    const debounced = useDebounce(inner, 500);

    useEffect(() => {
        setInner(value);
    }, [value]);

    useEffect(() => {
        onChange(debounced);
    }, [debounced]);
    return (
        <TextField
            value={inner}
            onChange={(event) => setInner(event.target.value)}
            size="small"
            placeholder="Search"
            sx={{ width: 220, mr: 1.5 }}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlined />
                        </InputAdornment>
                    )
                }
            }}
        />
    );
}
