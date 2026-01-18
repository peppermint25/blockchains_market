import { colors } from "@/app/styles/colors";

interface Charity {
  id: number;
  address: string;
  name: string;
}

interface CharitySelectProps {
  charities: Charity[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function CharitySelect({ charities, loading, value, onChange }: CharitySelectProps) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
        Select Charity *
      </label>
      {loading ? (
        <p style={{ color: colors.text.tertiary }}>Loading charities...</p>
      ) : charities.length === 0 ? (
        <p style={{ color: colors.text.tertiary }}>No verified charities available</p>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border outline-none"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
            color: colors.text.primary
          }}
        >
          <option value="">-- Select a charity --</option>
          {charities.map((charity) => (
            <option key={charity.id} value={charity.address}>
              {charity.name}
            </option>
          ))}
        </select>
      )}
      {value && (
        <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
          Proceeds will go to this charity after purchase is confirmed
        </p>
      )}
    </div>
  );
}
