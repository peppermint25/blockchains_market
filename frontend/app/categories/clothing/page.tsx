import ProductGrid from "@/app/components/ProductGrid";
import { CategoryIds } from "@/app/types";

export default function ClothingPage() {
  return (
    <ProductGrid
      title="Clothing"
      description="Browse our selection of clothing products"
      categoryFilter={CategoryIds.clothing}
    />
  );
}