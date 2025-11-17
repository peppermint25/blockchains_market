"use client";

import { colors } from "@/app/styles/colors";
import ProductCard from "@/app/components/ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductGridProps {
  title: string;
  description: string;
  products: Product[];
}

export default function ProductGrid({ title, description, products }: ProductGridProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
          {title}
        </h1>
        <p style={{ color: colors.text.tertiary }}>
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
