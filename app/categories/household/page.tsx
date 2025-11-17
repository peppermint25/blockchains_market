import ProductGrid from "@/app/components/ProductGrid";

const products = [
    { id: 9, name: "Coffee Maker", price: 79.99, image: "/next.svg" },
    { "id": 10, "name": "Lamp", "price": 49.99, "image": "/next.svg" },
    { id: 11, name: "Throw Pillow", price: 24.99, image: "/next.svg" },
    { id: 12, name: "Wall Art", price: 59.99, image: "/next.svg" },
    { id: 13, name: "Coffee Maker", price: 79.99, image: "/next.svg" },
    { id: 14, name: "Lamp", price: 49.99, image: "/next.svg" },
    { id: 15, name: "Throw Pillow", price: 24.99, image: "/next.svg" },
    { id: 16, name: "Wall Art", price: 59.99, image: "/next.svg" },
];

export default function HouseholdPage() {
  return (
    <ProductGrid
      title="Household"
      description="Browse our selection of household products"
      products={products}
    />
  );
}
