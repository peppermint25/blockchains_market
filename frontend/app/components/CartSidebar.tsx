"use client";
import Image from "next/image";
import { colors } from "@/app/styles/colors";
import { useCart } from "@/app/context/CartContext";
import { useWallet } from "@/app/hooks/useWallet";
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

export default function CartSidebar() {
  const { items, removeFromCart, clearCart, isOpen, closeCart, totalPrice } = useCart();
  const { isConnected, getSigner, connect } = useWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    if (items.length === 0) return;

    setIsPurchasing(true);
    setPurchaseStatus("Starting purchase...");

    try {
      const signer = await getSigner();
      if (!signer) {
        setPurchaseStatus("Failed to get wallet signer");
        setIsPurchasing(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Purchase each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setPurchaseStatus(`Purchasing item ${i + 1} of ${items.length}: ${item.name}...`);
        
        const tx = await contract.purchaseItem(item.id, {
          value: ethers.parseEther(item.price)
        });
        
        setPurchaseStatus(`Waiting for confirmation...`);
        await tx.wait();
      }

      setPurchaseStatus("All items purchased successfully!");
      clearCart();
      
      setTimeout(() => {
        setPurchaseStatus(null);
        closeCart();
      }, 2000);

    } catch (error: unknown) {
      console.error("Purchase error:", error);
      setPurchaseStatus(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed right-0 top-0 h-full w-96 z-50 shadow-xl flex flex-col"
        style={{ backgroundColor: colors.background.primary }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex justify-between items-center"
          style={{ borderColor: colors.border.primary }}
        >
          <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>
            Cart ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="text-2xl hover:opacity-70"
            style={{ color: colors.text.secondary }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center py-8" style={{ color: colors.text.tertiary }}>
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="flex gap-3 p-3 rounded-lg border"
                  style={{ 
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.secondary 
                  }}
                >
                  <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium truncate" 
                      style={{ color: colors.text.primary }}
                    >
                      {item.name}
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {item.price} ETH
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: colors.border.primary }}
        >
          {purchaseStatus && (
            <p 
              className="text-sm mb-3 text-center"
              style={{ color: colors.text.secondary }}
            >
              {purchaseStatus}
            </p>
          )}
          
          <div 
            className="flex justify-between mb-4"
            style={{ color: colors.text.primary }}
          >
            <span className="font-medium">Total:</span>
            <span className="font-bold">{totalPrice.toFixed(6)} ETH</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || isPurchasing}
            className="w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: colors.button.primary,
              color: colors.background.primary
            }}
          >
            {!isConnected 
              ? "Connect Wallet to Checkout"
              : isPurchasing 
                ? "Processing..." 
                : `Checkout (${items.length} items)`
            }
          </button>
        </div>
      </div>
    </>
  );
}