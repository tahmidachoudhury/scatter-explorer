import { FormControl, InputLabel, Select, MenuItem, ListSubheader } from "@mui/material";
import { isDegenerate, PROPERTIES } from "../lib/data";

interface Props {
    label: string;
    value: string;
    onChange: (key: string) => void;
    // This none choice is for the colour selector
    allowNone?: boolean;
}

export function PropertySelect({ label, value, onChange, allowNone = false }: Props) {
    const inputs = PROPERTIES.filter((p) => p.kind === "input");
    const outputs = PROPERTIES.filter((p) => p.kind === "output");

    const renderItem = (key: string) => (
        <MenuItem key={key} value={key}>
            {key}
            {isDegenerate(key) ? " (constant)" : ""}
        </MenuItem>
    );

    return (
        <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <InputLabel>{label}</InputLabel>
            <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
                {allowNone && <MenuItem value="">None</MenuItem>}
                <ListSubheader>Outputs (measurements)</ListSubheader>
                {outputs.map((p) => renderItem(p.key))}
                <ListSubheader>Inputs (ingredients)</ListSubheader>
                {inputs.map((p) => renderItem(p.key))}
            </Select>
        </FormControl>
    );
}
