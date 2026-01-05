import ProductGrid from "@/app/components/ProductGrid";
import { CategoryIds } from "@/app/types";

export default function ElectronicsPage() {
  return (
    <ProductGrid
      title="Electronics"
      description="Browse our selection of electronic products"
      categoryFilter={CategoryIds.electronics}
    />
  );
}