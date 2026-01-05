import ProductGrid from "@/app/components/ProductGrid";
import { CategoryIds } from "@/app/types";

export default function HobbiesPage() {
  return (
    <ProductGrid
      title="Hobbies"
      description="Browse books, art supplies, craft materials, and games"
      categoryFilter={CategoryIds.hobbies}
    />
  );
}