import ProductGrid from "@/app/components/ProductGrid";
import { CategoryIds } from "@/app/types";

export default function HouseholdPage() {
  return (
    <ProductGrid
      title="House Goods"
      description="Browse our selection of household products"
      categoryFilter={CategoryIds.household}
    />
  );
}