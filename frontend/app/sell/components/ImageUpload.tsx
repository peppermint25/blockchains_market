import { colors } from "@/app/styles/colors";
import Image from "next/image";

interface ImageUploadProps {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUpload({ preview, onChange }: ImageUploadProps) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
        Item Image *
      </label>
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80"
        style={{ borderColor: colors.border.primary, backgroundColor: colors.background.primary }}
        onClick={() => document.getElementById("image-input")?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
        ) : (
          <div style={{ color: colors.text.tertiary }}>
            <p className="text-4xl mb-2">📷</p>
            <p>Click to upload image</p>
          </div>
        )}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
