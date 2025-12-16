import ProductGrid from "@/app/components/ProductGrid";

const products = [
    { id: 1, name: "T-Shirt", price: 29.99, image: "/next.svg" },
    { id: 2, name: "Jeans", price: 79.99, image: "/next.svg" },
    { id: 3, name: "Jacket", price: 149.99, image: "/next.svg" },
    { id: 4, name: "Sneakers", price: 89.99, image: "/next.svg" },
    { id: 5, name: "T-Shirt", price: 29.99, image: "/next.svg" },
    { id: 6, name: "Jeans", price: 79.99, image: "/next.svg" },
    { id: 7, name: "Jacket", price: 149.99, image: "/next.svg" },
    { id: 8, name: "Sneakers", price: 89.99, image: "/next.svg" },
];

export default function ClothingPage() {
  return (
    <ProductGrid
      title="Clothing"
      description="Browse our selection of clothing products"
      products={products}
    />
  );
}
