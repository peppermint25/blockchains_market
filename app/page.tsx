"use client";

import Navigation from "@/app/components/Navigation";
import { colors } from "@/app/styles/colors";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";

// Sample product data
const products = [
  { id: 1, name: "Product 1", price: 29.99, image: "/next.svg" },
  { id: 2, name: "Product 2", price: 49.99, image: "/next.svg" },
  { id: 3, name: "Product 3", price: 39.99, image: "/next.svg" },
  { id: 4, name: "Product 4", price: 59.99, image: "/next.svg" },
  { id: 5, name: "Product 5", price: 19.99, image: "/next.svg" },
  { id: 6, name: "Product 6", price: 79.99, image: "/next.svg" },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <Navigation />

      <section className="py-20" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text.primary }}>
            The secondhand market built for your peace of mind
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.tertiary }}>
            Discover amazing products at great prices. Don&#39;t worry about your privacy.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8" style={{ color: colors.text.primary }}>
          You might be interested:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

     <Footer />
    </div>
  );
}
