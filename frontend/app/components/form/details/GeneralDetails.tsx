import { TextField, SelectField } from "./shared/FormComponents";
import { CONDITIONS } from "./shared/constants";

type GeneralField = "condition" | "brand" | "color" | "size";

interface GeneralDetailsProps {
    formData: Record<GeneralField, string>;
    onChange: (field: GeneralField, value: string) => void;
}

export function GeneralDetails({ formData, onChange }: GeneralDetailsProps) {
    return (
        <>
            <SelectField
                label="Condition"
                value={formData.condition}
                options={CONDITIONS}
                placeholder="Select condition"
                onChange={(v) => onChange("condition", v)}
            />

            <TextField
                label="Brand"
                value={formData.brand}
                placeholder="e.g., IKEA, Samsung"
                onChange={(v) => onChange("brand", v)}
            />

            <TextField
                label="Color"
                value={formData.color}
                placeholder="e.g., White, Silver"
                onChange={(v) => onChange("color", v)}
            />

            <TextField
                label="Size"
                value={formData.size}
                placeholder="e.g., 15 inch, 10x12"
                onChange={(v) => onChange("size", v)}
            />
        </>
    );
}
