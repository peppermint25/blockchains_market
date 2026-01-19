import { TextField, SelectField } from "./shared/FormComponents";
import { CONDITIONS, SPORT_TYPES } from "./shared/constants";

type SportsGoodsField =
    | "sportType"
    | "equipmentType"
    | "condition"
    | "brand"
    | "weight"
    | "material"
    | "size"
    | "color";

interface SportsGoodsDetailsProps {
    formData: Record<SportsGoodsField, string>;
    onChange: (field: SportsGoodsField, value: string) => void;
}

export function SportsGoodsDetails({ formData, onChange }: SportsGoodsDetailsProps) {
    return (
        <>
            <SelectField
                label="Sport Type"
                value={formData.sportType}
                options={SPORT_TYPES}
                placeholder="Select sport type"
                onChange={(v) => onChange("sportType", v)}
            />

            <TextField
                label="Equipment Type"
                value={formData.equipmentType}
                placeholder="e.g., Ball, Racket, Weights"
                onChange={(v) => onChange("equipmentType", v)}
            />

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
                placeholder="e.g., Nike, Adidas"
                onChange={(v) => onChange("brand", v)}
            />

            <TextField
                label="Weight"
                value={formData.weight}
                placeholder="e.g., 5kg, 20lbs"
                onChange={(v) => onChange("weight", v)}
            />

            <TextField
                label="Material"
                value={formData.material}
                placeholder="e.g., Leather, Steel, Rubber"
                onChange={(v) => onChange("material", v)}
            />

            <TextField
                label="Size"
                value={formData.size}
                placeholder="e.g., Size 5, 27 inch"
                onChange={(v) => onChange("size", v)}
            />

            <TextField
                label="Color"
                value={formData.color}
                placeholder="e.g., Black, Red"
                onChange={(v) => onChange("color", v)}
            />
        </>
    );
}
