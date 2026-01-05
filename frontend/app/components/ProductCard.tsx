"use client";
import Link from "next/link";
import { colors } from "@/app/styles/colors";
import { DisplayListing, CategoryNames } from "@/app/types";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  product: DisplayListing;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  
  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking button
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="rounded-lg border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
        style={{
          backgroundColor: colors.background.primary,
          borderColor: colors.border.primary
        }}
      >
        <div
          className="aspect-square relative"
          style={{ backgroundColor: colors.background.tertiary }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              📦
            </div>
          )}
          <span 
            className="absolute top-2 left-2 px-2 py-1 text-xs rounded"
            style={{ 
              backgroundColor: colors.background.primary,
              color: colors.text.secondary
            }}
          >
            {CategoryNames[product.category]}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 truncate" style={{ color: colors.text.primary }}>
            {product.name}
          </h3>
          <p className="text-sm mb-2 truncate" style={{ color: colors.text.tertiary }}>
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold" style={{ color: colors.text.primary }}>
              {product.price} ETH
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isInCart ? colors.button.secondary : colors.button.primary,
                color: isInCart ? colors.text.primary : colors.background.primary
              }}
            >
              {isInCart ? "In Cart" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}