import ProductGrid from "@/app/components/ProductGrid";

const products = [
    { id: 1, name: "Laptop", price: 999.99, image: "/next.svg" },
    { id: 2, name: "Smartphone", price: 699.99, image: "/next.svg" },
    { id: 3, name: "Headphones", price: 149.99, image: "/next.svg" },
    { id: 4, name: "Tablet", price: 499.99, image: "/next.svg" },
    { id: 5, name: "Laptop", price: 999.99, image: "/next.svg" },
    { id: 6, name: "Smartphone", price: 699.99, image: "/next.svg" },
    { id: 7, name: "Headphones", price: 149.99, image: "/next.svg" },
    { id: 8, name: "Tablet", price: 499.99, image: "/next.svg" },
];

export default function ElectronicsPage() {
  return (
    <ProductGrid
      title="Electronics"
      description="Browse our selection of electronics products"
      products={products}
    />
  );
}
