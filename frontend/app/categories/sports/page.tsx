import ProductGrid from "@/app/components/ProductGrid";
import { CategoryIds } from "@/app/types";

export default function SportsPage() {
  return (
    <ProductGrid
      title="Sports Goods"
      description="Browse our selection of sports products"
      categoryFilter={CategoryIds.sports}
    />
  );
}