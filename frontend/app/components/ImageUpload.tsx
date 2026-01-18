import { colors } from "@/app/styles/colors";

interface ImageUploadProps {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  inputId?: string;
  maxHeight?: string;
  placeholder?: string;
}

export function ImageUpload({
  preview,
  onChange,
  label = "Item Image",
  required = true,
  inputId = "image-input",
  maxHeight = "max-h-64",
  placeholder = "Click to upload image"
}: ImageUploadProps) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
        {label} {required && "*"}
      </label>
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80"
        style={{ borderColor: colors.border.primary, backgroundColor: colors.background.primary }}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className={`${maxHeight} mx-auto rounded`} />
        ) : (
          <div style={{ color: colors.text.tertiary }}>
            <p className="text-4xl mb-2">📷</p>
            <p>{placeholder}</p>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
