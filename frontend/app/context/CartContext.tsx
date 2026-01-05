"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { DisplayListing } from "@/app/types";

interface CartItem extends DisplayListing {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: DisplayListing) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product: DisplayListing) => {
    setItems(prev => {
      // Check if already in cart
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev; // Already in cart, don't add again (each listing is unique)
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true); // Open cart when adding
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}