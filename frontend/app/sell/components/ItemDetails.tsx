import { colors } from "@/app/styles/colors";
import { ClothingDetails } from "./details/ClothingDetails";
import { SportsGoodsDetails } from "./details/SportsGoodsDetails";
import { ElectronicsDetails } from "./details/ElectronicsDetails";
import { GeneralDetails } from "./details/GeneralDetails";

interface ItemDetailsProps {
  category: number;
  formData: {
    gender: string;
    condition: string;
    size: string;
    color: string;
    brand: string;
    sportType: string;
    equipmentType: string;
    weight: string;
    material: string;
    modelNumber: string;
    storageCapacity: string;
    screenSize: string;
    batteryHealth: string;
    ram: string;
    operatingSystem: string;
  };
  onChange: (field: string, value: string) => void;
}

export function ItemDetails({ category, formData, onChange }: ItemDetailsProps) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: colors.background.primary }}
    >
      <h3 className="font-medium mb-4" style={{ color: colors.text.primary }}>
        Item Details (Optional)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Clothing (0) */}
        {category === 0 && (
          <ClothingDetails
            formData={{
              gender: formData.gender,
              condition: formData.condition,
              size: formData.size,
              color: formData.color,
              brand: formData.brand
            }}
            onChange={onChange}
          />
        )}

        {/* Electronics (2) */}
        {category === 2 && (
          <ElectronicsDetails
            formData={{
              modelNumber: formData.modelNumber,
              storageCapacity: formData.storageCapacity,
              screenSize: formData.screenSize,
              batteryHealth: formData.batteryHealth,
              ram: formData.ram,
              operatingSystem: formData.operatingSystem,
              condition: formData.condition,
              brand: formData.brand,
              color: formData.color
            }}
            onChange={onChange}
          />
        )}

        {/* Sports Goods (3) */}
        {category === 3 && (
          <SportsGoodsDetails
            formData={{
              sportType: formData.sportType,
              equipmentType: formData.equipmentType,
              condition: formData.condition,
              brand: formData.brand,
              weight: formData.weight,
              material: formData.material,
              size: formData.size,
              color: formData.color
            }}
            onChange={onChange}
          />
        )}

        {/* House Goods (1), Hobbies (4) */}
        {(category === 1 || category === 4) && (
          <GeneralDetails
            formData={{
              condition: formData.condition,
              brand: formData.brand,
              color: formData.color,
              size: formData.size
            }}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
