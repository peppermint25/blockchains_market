import { colors } from "@/app/styles/colors";
import { CategoryNames } from "@/app/types";

interface CategorySelectProps {
  value: number;
  onChange: (value: number) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
        Category *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-3 rounded-lg border outline-none"
        style={{
          backgroundColor: colors.background.primary,
          borderColor: colors.border.primary,
          color: colors.text.primary
        }}
      >
        {Object.entries(CategoryNames).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </div>
  );
}
