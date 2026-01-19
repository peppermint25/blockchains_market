import { TextField, SelectField } from "./shared/FormComponents";
import { CONDITIONS, STORAGE_OPTIONS, BATTERY_HEALTH_OPTIONS, RAM_OPTIONS } from "./shared/constants";

type ElectronicsField =
    | "modelNumber"
    | "storageCapacity"
    | "screenSize"
    | "batteryHealth"
    | "ram"
    | "operatingSystem"
    | "condition"
    | "brand"
    | "color";

interface ElectronicsDetailsProps {
    formData: Record<ElectronicsField, string>;
    onChange: (field: ElectronicsField, value: string) => void;
}

export function ElectronicsDetails({ formData, onChange }: ElectronicsDetailsProps) {
    return (
        <>
            <TextField
                label="Model Number / Year"
                value={formData.modelNumber}
                placeholder="e.g., iPhone 12, 2021 MacBook Pro"
                onChange={(v) => onChange("modelNumber", v)}
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
                placeholder="e.g., Apple, Samsung, Dell"
                onChange={(v) => onChange("brand", v)}
            />

            <SelectField
                label="Storage Capacity"
                value={formData.storageCapacity}
                options={STORAGE_OPTIONS}
                placeholder="Select storage"
                onChange={(v) => onChange("storageCapacity", v)}
            />

            <TextField
                label="Screen Size"
                value={formData.screenSize}
                placeholder="e.g., 6.1 inch, 15.6 inch"
                onChange={(v) => onChange("screenSize", v)}
            />

            <SelectField
                label="Battery Health"
                value={formData.batteryHealth}
                options={BATTERY_HEALTH_OPTIONS}
                placeholder="Select battery health"
                onChange={(v) => onChange("batteryHealth", v)}
            />

            <SelectField
                label="RAM / Memory"
                value={formData.ram}
                options={RAM_OPTIONS}
                placeholder="Select RAM"
                onChange={(v) => onChange("ram", v)}
            />

            <TextField
                label="Operating System"
                value={formData.operatingSystem}
                placeholder="e.g., iOS 15, Windows 11, Android 12"
                onChange={(v) => onChange("operatingSystem", v)}
            />

            <TextField
                label="Color"
                value={formData.color}
                placeholder="e.g., Space Gray, Black"
                onChange={(v) => onChange("color", v)}
            />
        </>
    );
}
