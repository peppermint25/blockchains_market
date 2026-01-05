"use client";
import { colors } from "@/app/styles/colors";
import ProductCard from "@/app/components/ProductCard";
import { useListings } from "@/app/hooks/useListings";
import { DisplayListing } from "@/app/types";

interface ProductGridProps {
  title: string;
  description: string;
  categoryFilter?: number;
}

export default function ProductGrid({ title, description, categoryFilter }: ProductGridProps) {
  const { listings, loading, error } = useListings(categoryFilter);

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

      {loading && (
        <div className="text-center py-12">
          <p style={{ color: colors.text.secondary }}>Loading listings from blockchain...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: colors.text.secondary }}>No listings found in this category</p>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}