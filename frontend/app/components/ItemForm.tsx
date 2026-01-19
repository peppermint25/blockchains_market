"use client";

import { colors } from "@/app/styles/colors";
import { useCharities } from "@/app/hooks/useCharities";
import { useItemForm } from "@/app/hooks/useItemForm";
import { ImageUpload } from "@/app/components/form/ImageUpload";
import { CategorySelect } from "@/app/components/form/CategorySelect";
import { CharitySelect } from "@/app/components/form/CharitySelect";
import { ItemDetails } from "@/app/components/form/ItemDetails";

interface ItemFormProps {
  mode: "sell" | "donate";
  preselectedCharity: string;
  header: React.ReactNode;
  submitButtonText: string;
  submitButtonColor: string;
}

export function ItemForm({ 
  mode, 
  preselectedCharity, 
  header,
  submitButtonText,
  submitButtonColor
}: ItemFormProps) {
  const { charities, loading: charitiesLoading } = useCharities();
  const {
    formData,
    imagePreview,
    isSubmitting,
    status,
    isConnected,
    handleImageChange,
    handleFieldChange,
    handleSubmit
  } = useItemForm({ mode, preselectedCharity });

  return (
    <div className="max-w-2xl mx-auto px-4">
      {header}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <CategorySelect
          value={formData.category}
          onChange={(value) => handleFieldChange("category", value)}
        />

        {/* Image Upload */}
        <ImageUpload preview={imagePreview} onChange={handleImageChange} />

        {/* Name */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder={mode === "donate" ? "e.g., Winter Jacket" : "e.g., Vintage Leather Jacket"}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            required
            rows={mode === "donate" ? 3 : 4}
            className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder={mode === "donate" ? "Describe the item you're donating..." : "Describe your item in detail..."}
          />
        </div>

        {/* Price - Only for Sell */}
        {mode === "sell" && (
          <div>
            <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
              Price (ETH) *
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={formData.price}
              onChange={(e) => handleFieldChange("price", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.primary,
                color: colors.text.primary
              }}
              placeholder="0.01"
            />
          </div>
        )}

        {/* Charity Selection */}
        <CharitySelect
          charities={charities}
          loading={charitiesLoading}
          value={formData.charityAddress}
          onChange={(value) => handleFieldChange("charityAddress", value)}
          label={mode === "donate" ? "Donate To *" : "Select Charity *"}
        />

        {/* Item Details - Category Dependent */}
        <ItemDetails
          category={formData.category}
          formData={{
            gender: formData.gender,
            condition: formData.condition,
            size: formData.size,
            color: formData.color,
            brand: formData.brand,
            sportType: formData.sportType,
            equipmentType: formData.equipmentType,
            weight: formData.weight,
            material: formData.material,
            modelNumber: formData.modelNumber,
            storageCapacity: formData.storageCapacity,
            screenSize: formData.screenSize,
            batteryHealth: formData.batteryHealth,
            ram: formData.ram,
            operatingSystem: formData.operatingSystem
          }}
          onChange={handleFieldChange}
        />

        {/* Status Message */}
        {status && (
          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
          >
            {status}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (charities.length === 0)}
          className="w-full py-4 rounded-lg font-medium text-lg transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: submitButtonColor,
            color: mode === "donate" ? "white" : colors.background.primary
          }}
        >
          {!isConnected
            ? `Connect Wallet to ${mode === "donate" ? "Donate" : "Sell"}`
            : isSubmitting
              ? mode === "donate" ? "Donating Item..." : "Creating Listing..."
              : submitButtonText
          }
        </button>
      </form>
    </div>
  );
}
