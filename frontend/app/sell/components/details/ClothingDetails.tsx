import { TextField, SelectField } from "./shared/FormComponents";
import { CONDITIONS, GENDER_OPTIONS } from "./shared/constants";

type ClothingField = "gender" | "condition" | "size" | "color" | "brand";

interface ClothingDetailsProps {
    formData: Record<ClothingField, string>;
    onChange: (field: ClothingField, value: string) => void;
}

export function ClothingDetails({ formData, onChange }: ClothingDetailsProps) {
    return (
        <>
            <SelectField
                label="Gender"
                value={formData.gender}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
                onChange={(v) => onChange("gender", v)}
            />

            <SelectField
                label="Condition"
                value={formData.condition}
                options={CONDITIONS}
                placeholder="Select condition"
                onChange={(v) => onChange("condition", v)}
            />

            <TextField
                label="Size"
                value={formData.size}
                placeholder="e.g., M, L, XL"
                onChange={(v) => onChange("size", v)}
            />

            <TextField
                label="Color"
                value={formData.color}
                placeholder="e.g., Black, Navy Blue"
                onChange={(v) => onChange("color", v)}
            />

            <TextField
                label="Brand"
                value={formData.brand}
                placeholder="e.g., Nike, Zara"
                onChange={(v) => onChange("brand", v)}
            />
        </>
    );
}
