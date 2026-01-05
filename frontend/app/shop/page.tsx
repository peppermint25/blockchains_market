"use client";

import { useState, useMemo } from "react";
import { colors } from "@/app/styles/colors";
import { useListings } from "@/app/hooks/useListings";
import { CategoryNames } from "@/app/types";
import ProductCard from "@/app/components/ProductCard";

export default function ShopPage() {
  const { listings, loading, error } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== null) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
      default:
        // Already newest first from API
        break;
    }

    return filtered;
  }, [listings, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
            Shop All Items
          </h1>
          <p style={{ color: colors.text.tertiary }}>
            Browse secondhand items and support local charities
          </p>
        </div>

        {/* Search and Filters */}
        <div 
          className="p-4 rounded-lg mb-8"
          style={{ backgroundColor: colors.background.primary }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full px-4 py-3 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary,
                  color: colors.text.primary
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory(e.target.value === "" ? null : parseInt(e.target.value))}
              className="px-4 py-3 rounded-lg border outline-none"
              style={{
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.primary,
                color: colors.text.primary
              }}
            >
              <option value="">All Categories</option>
              {Object.entries(CategoryNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price-low" | "price-high")}
              className="px-4 py-3 rounded-lg border outline-none"
              style={{
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.primary,
                color: colors.text.primary
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== null) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm" style={{ color: colors.text.tertiary }}>
                Active filters:
              </span>
              {searchQuery && (
                <span 
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}
                >
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:opacity-70">✕</button>
                </span>
              )}
              {selectedCategory !== null && (
                <span 
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}
                >
                  {CategoryNames[selectedCategory]}
                  <button onClick={() => setSelectedCategory(null)} className="hover:opacity-70">✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="text-sm underline"
                style={{ color: colors.text.tertiary }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p style={{ color: colors.text.secondary }}>
            {loading ? "Loading..." : `${filteredListings.length} items found`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>Loading listings from blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg mb-2" style={{ color: colors.text.primary }}>
              No items found
            </p>
            <p style={{ color: colors.text.secondary }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}