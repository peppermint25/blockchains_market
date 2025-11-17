import ProductGrid from "@/app/components/ProductGrid";

const products = [
    { id: 17, name: "Yoga Mat", price: 39.99, image: "/next.svg" },
    { id: 18, name: "Dumbbells", price: 89.99, image: "/next.svg" },
    { id: 19, name: "Running Shoes", price: 129.99, image: "/next.svg" },
    { id: 20, name: "Water Bottle", price: 19.99, image: "/next.svg" },
    { id: 21, name: "Yoga Mat", price: 39.99, image: "/next.svg" },
    { id: 22, name: "Dumbbells", price: 89.99, image: "/next.svg" },
    { id: 23, name: "Running Shoes", price: 129.99, image: "/next.svg" },
    { id: 24, name: "Water Bottle", price: 19.99, image: "/next.svg" },
];

export default function SportsPage() {
  return (
    <ProductGrid
      title="Sports"
      description="Browse our selection of sports products"
      products={products}
    />
  );
}
