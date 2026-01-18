export interface Listing {
  id: number;
  seller: string;
  metadataURI: string;
  price: bigint;
  category: number;
  status: number;
  charity: string;
}

export interface ListingMetadata {
  name: string;
  description: string;
  image: string;
  condition?: string;
  size?: string;
  color?: string;
  brand?: string;
  gender?: string;
  sportType?: string;
  equipmentType?: string;
  weight?: string;
  material?: string;
  modelNumber?: string;
  storageCapacity?: string;
  screenSize?: string;
  batteryHealth?: string;
  ram?: string;
  operatingSystem?: string;
}

export interface DisplayListing {
  id: number;
  name: string;
  description: string;
  price: string;
  priceWei: string;
  image: string;
  category: number;
  seller: string;
  charity: string;
  charityName?: string;
  status: number;
  details?: {
    condition: string;
    size: string;
    color: string;
    brand: string;
    gender: string;
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
}

export const CategoryNames: Record<number, string> = {
  0: "Clothing",
  1: "House Goods",
  2: "Electronics",
  3: "Sports Goods",
  4: "Hobbies"
};

export const CategoryRoutes: Record<number, string> = {
  0: "clothing",
  1: "household",
  2: "electronics",
  3: "sports",
  4: "hobbies"
};

export const CategoryIds: Record<string, number> = {
  clothing: 0,
  household: 1,
  electronics: 2,
  sports: 3,
  hobbies: 4
};

export const ListingStatus = {
  Active: 0,
  Sold: 1,
  Cancelled: 2
};