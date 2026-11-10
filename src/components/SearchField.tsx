/**
*  SearchField.tsx
*
*  @copyright 2026 Digital Aid Seattle
*
*/
import {
    SearchOutlined
} from "@ant-design/icons";
import {
    InputAdornment,
    TextField
} from "@mui/material";
import { useEffect, useRef } from "react";

const DEBOUNCE_MS = 500;

export function SearchField({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Sync external changes (e.g. a reset) into the uncontrolled input
    useEffect(() => {
        if (inputRef.current && inputRef.current.value !== value) {
            inputRef.current.value = value;
        }
    }, [value]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(next), DEBOUNCE_MS);
    };

    return (
        <TextField
            inputRef={inputRef}
            defaultValue={value}
            onChange={handleChange}
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
