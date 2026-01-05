"use client";
import Image from "next/image";
import { colors } from "@/app/styles/colors";
import { DisplayListing, CategoryNames } from "@/app/types";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  product: DisplayListing;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  
  const isInCart = items.some(item => item.id === product.id);

  return (
    <div
      className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary
      }}
    >
      <div
        className="aspect-square relative"
        style={{ backgroundColor: colors.background.tertiary }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
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
            onClick={() => addToCart(product)}
            disabled={isInCart}
            className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: isInCart ? colors.button.secondary : colors.button.primary,
              color: isInCart ? colors.text.primary : colors.background.primary
            }}
          >
            {isInCart ? "In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
