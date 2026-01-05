"use client";

import { colors } from "@/app/styles/colors";
import { useCharities } from "@/app/hooks/useCharities";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { charities, loading, error } = useCharities();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text.primary }}>
            Support Causes That Matter
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: colors.text.tertiary }}>
            Buy and sell secondhand items. All proceeds go to verified charities.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.button.primary,
                color: colors.background.primary
              }}
            >
              Browse Items
            </Link>
            <Link
              href="/sell"
              className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.button.secondary,
                color: colors.text.primary
              }}
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* Charities Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8" style={{ color: colors.text.primary }}>
          Verified Charities
        </h2>

        {loading && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>Loading charities...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {!loading && !error && charities.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>No verified charities yet</p>
          </div>
        )}

        {!loading && !error && charities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className="rounded-lg shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: colors.background.primary }}
              >
                <div 
                  className="relative h-48 flex items-center justify-center" 
                  style={{ backgroundColor: colors.background.tertiary }}
                >
                  <span className="text-6xl">🏛️</span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    {charity.name}
                  </h3>

                  <p className="mb-4 text-sm" style={{ color: colors.text.secondary }}>
                    {charity.description || "Supporting important causes in our community."}
                  </p>

                  <div 
                    className="flex justify-between items-center pt-4 border-t"
                    style={{ borderColor: colors.border.primary }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: colors.text.tertiary }}>Total Received</p>
                      <p className="font-bold" style={{ color: colors.text.primary }}>
                        {charity.totalReceived} ETH
                      </p>
                    </div>
                    <Link
                      href={`/sell?charity=${charity.address}`}
                      className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 uppercase text-sm"
                      style={{
                        backgroundColor: colors.button.primary,
                        color: colors.background.primary,
                      }}
                    >
                      Support
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* How It Works Section */}
      <section className="py-16" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-12 text-center" style={{ color: colors.text.primary }}>
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text.primary }}>
                1. List Your Item
              </h3>
              <p style={{ color: colors.text.secondary }}>
                Upload photos, set a price, and choose a charity to support
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text.primary }}>
                2. Buyer Purchases
              </h3>
              <p style={{ color: colors.text.secondary }}>
                Payment is held securely in escrow until delivery is confirmed
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text.primary }}>
                3. Charity Receives
              </h3>
              <p style={{ color: colors.text.secondary }}>
                After 14 days, funds are automatically released to the charity
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}