"use client";

import Image from "next/image";
import { colors } from "@/app/styles/colors";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary
      }}
    >
      <div
        className="aspect-square flex items-center justify-center"
        style={{ backgroundColor: colors.background.tertiary }}
      >
        <Image
          className="invert"
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: colors.text.primary }}>
            ${product.price}
          </span>
            <button
                className="px-3 py-1 rounded-lg transition-colors"
                style={{
                    backgroundColor: colors.button.primary,
                    color: colors.background.primary
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.button.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button.primary}
            >
                <Image
                    src="/images/cart.png"
                    alt="Add to Cart"
                    width={30}
                    height={20}
                />
            </button>
        </div>
      </div>
    </div>
  );
}
