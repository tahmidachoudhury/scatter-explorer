import { PROPERTIES } from "../lib/data";

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

    const renderOption = (key: string) => {
        return (
            <option key={key} value="key">
                {key}
            </option>
        )
    }

    return (
        <label className="field">
            <span className="field-label">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {allowNone && <option value="">None</option>}
                <optgroup label="Outputs (measurements)">{outputs.map((p) => renderOption(p.key))}</optgroup>
                <optgroup label="Inputs (ingredients)">{inputs.map((p) => renderOption(p.key))}</optgroup>
            </select>
        </label>
    );
}