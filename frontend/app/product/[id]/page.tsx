"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { useCart } from "@/app/context/CartContext";
import { DisplayListing, CategoryNames } from "@/app/types";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, connect } = useWallet();
  const { addToCart, items, openCart } = useCart();
  
  const [product, setProduct] = useState<DisplayListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/listing/${productId}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setProduct(data.listing);
        }
      } catch (e) {
        setError("Failed to fetch product");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const isInCart = product ? items.some(item => item.id === product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!isConnected) {
      connect();
      return;
    }

    if (!isInCart) {
      addToCart(product);
    }
    openCart();
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Loading state - accessible to everyone
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p style={{ color: colors.text.primary }}>Loading product...</p>
      </div>
    );
  }

  // Error state - accessible to everyone
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="text-5xl mb-4">😕</p>
        <p className="text-lg mb-4" style={{ color: colors.text.primary }}>
          {error || "Product not found"}
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // Product view - accessible to everyone
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm hover:opacity-70"
          style={{ color: colors.text.secondary }}
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div 
            className="aspect-square rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.background.primary }}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                📦
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm mb-4"
              style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
            >
              {CategoryNames[product.category]}
            </span>

            <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text.primary }}>
              {product.name}
            </h1>

            <p className="text-4xl font-bold mb-6" style={{ color: colors.text.primary }}>
              {product.price} ETH
            </p>

            <div 
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: colors.background.primary }}
            >
              <h3 className="font-medium mb-2" style={{ color: colors.text.primary }}>
                Description
              </h3>
              <p style={{ color: colors.text.secondary }}>
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Item Details */}
            {product.details && Object.values(product.details).some(val => val) && (
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: colors.background.primary }}
              >
                <h3 className="font-medium mb-3" style={{ color: colors.text.primary }}>
                  Item Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.details.condition && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Condition: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.condition}</span>
                    </div>
                  )}
                  {product.details.brand && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Brand: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.brand}</span>
                    </div>
                  )}
                  {product.details.size && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Size: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.size}</span>
                    </div>
                  )}
                  {product.details.color && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Color: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.color}</span>
                    </div>
                  )}
                  {product.details.gender && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Gender: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.gender}</span>
                    </div>
                  )}
                  {product.details.material && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Material: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.material}</span>
                    </div>
                  )}
                  {product.details.weight && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Weight: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.weight}</span>
                    </div>
                  )}
                  {product.details.sportType && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Sport Type: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.sportType}</span>
                    </div>
                  )}
                  {product.details.equipmentType && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Equipment Type: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.equipmentType}</span>
                    </div>
                  )}
                  {product.details.modelNumber && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Model Number: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.modelNumber}</span>
                    </div>
                  )}
                  {product.details.screenSize && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Screen Size: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.screenSize}</span>
                    </div>
                  )}
                  {product.details.storageCapacity && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Storage: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.storageCapacity}</span>
                    </div>
                  )}
                  {product.details.ram && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>RAM: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.ram}</span>
                    </div>
                  )}
                  {product.details.batteryHealth && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Battery Health: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.batteryHealth}</span>
                    </div>
                  )}
                  {product.details.operatingSystem && (
                    <div>
                      <span style={{ color: colors.text.tertiary }}>Operating System: </span>
                      <span style={{ color: colors.text.primary }}>{product.details.operatingSystem}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller & Charity Info */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: colors.background.primary }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: colors.text.tertiary }}>Seller</span>
                <span style={{ color: colors.text.primary }}>{formatAddress(product.seller)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.text.tertiary }}>Proceeds go to</span>
                <Link
                  href={`/charity/${product.charity}`}
                  className="hover:underline"
                  style={{ color: colors.button.primary }}
                >
                  {product.charityName || formatAddress(product.charity)}
                </Link>
              </div>
            </div>

            {/* Action Buttons - Available to everyone */}
            {product.status === 0 ? (
              <div className="space-y-3">
                {/* Add to Cart - Works for everyone */}
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-full py-4 rounded-lg font-medium text-lg transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: isInCart ? colors.button.secondary : colors.button.primary,
                    color: isInCart ? colors.text.primary : colors.background.primary
                  }}
                >
                  {isInCart ? "✓ Added to Cart" : "Add to Cart"}
                </button>

                {/* Buy Now - Prompts wallet connection if not connected */}
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-lg font-medium text-lg transition-all hover:opacity-90 border"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: colors.button.primary,
                    color: colors.button.primary
                  }}
                >
                  {isConnected ? "Buy Now" : "Connect Wallet to Buy"}
                </button>

                {!isConnected && (
                  <p className="text-center text-sm" style={{ color: colors.text.tertiary }}>
                    You can add items to cart, but you&apos;ll need to connect your wallet to complete the purchase.
                  </p>
                )}
              </div>
            ) : (
              <div 
                className="w-full py-4 rounded-lg text-center font-medium"
                style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
              >
                This item is no longer available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}