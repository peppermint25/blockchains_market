"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { useOrders, OrderStatus, OrderStatusColor } from "@/app/hooks/useOrders";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

export default function OrdersPage() {
  const { isConnected, connect, address, getSigner } = useWallet();
  const { orders, loading, error, refetch } = useOrders(address);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const handleConfirmDelivery = async (orderId: number) => {
    setActionLoading(orderId);
    setActionStatus("Confirming delivery...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.confirmDelivery(orderId);
      
      setActionStatus("Waiting for confirmation...");
      await tx.wait();

      setActionStatus("Delivery confirmed!");
      await refetch();
    } catch (error: unknown) {
      console.error("Error confirming delivery:", error);
      setActionStatus(error instanceof Error ? error.message : "Failed to confirm delivery");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleOpenDispute = async (orderId: number) => {
    const reason = prompt("Enter the reason for dispute:");
    if (!reason) return;

    setActionLoading(orderId);
    setActionStatus("Opening dispute...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.openDispute(orderId, reason);
      
      setActionStatus("Waiting for confirmation...");
      await tx.wait();

      setActionStatus("Dispute opened!");
      await refetch();
    } catch (error: unknown) {
      console.error("Error opening dispute:", error);
      setActionStatus(error instanceof Error ? error.message : "Failed to open dispute");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const canConfirmDelivery = (status: number) => status === 1; // Shipped
  const canOpenDispute = (status: number, deliveredAt: number) => {
    if (status === 1) return true; // Can dispute if shipped
    if (status === 2) {
      // Can dispute within 14 days of delivery
      const disputeWindow = 14 * 24 * 60 * 60; // 14 days in seconds
      return Date.now() / 1000 < deliveredAt + disputeWindow;
    }
    return false;
  };

    if (!isConnected || !address) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="mb-4 text-lg" style={{ color: colors.text.primary }}>
            Connect your wallet to view your orders
        </p>
        <button
            onClick={connect}
            className="px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
        >
            Connect Wallet
        </button>
        </div>
    );
    }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text.primary }}>
          My Orders
        </h1>

        {actionStatus && (
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
          >
            {actionStatus}
          </div>
        )}

        

        {loading && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-4" style={{ color: colors.text.secondary }}>
              You haven&apos;t made any purchases yet
            </p>

            <a
              href="/categories/clothing"
              className="px-6 py-3 rounded-lg font-medium inline-block"
              style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
            >
              Browse Items
            </a>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: colors.background.primary }}
              >
                <div className="flex gap-4 p-4">
                  {/* Item Image */}
                  <div 
                    className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative"
                    style={{ backgroundColor: colors.background.tertiary }}
                    >
                    {order.item.image && order.item.image.length > 0 ? (
                        <Image
                        src={order.item.image}
                        alt={order.item.name}
                        fill
                        className="object-cover"
                        unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                        📦
                        </div>
                    )}
                    </div>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg" style={{ color: colors.text.primary }}>
                        {order.item.name}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: OrderStatusColor[order.status] }}
                      >
                        {OrderStatus[order.status]}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: colors.text.tertiary }}>
                      {order.item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Amount: </span>
                        <span style={{ color: colors.text.primary }}>{order.amount} ETH</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Charity: </span>
                        <span style={{ color: colors.text.primary }}>{order.charityName}</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Shipped: </span>
                        <span style={{ color: colors.text.primary }}>{formatDate(order.shippedAt)}</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Delivered: </span>
                        <span style={{ color: colors.text.primary }}>{formatDate(order.deliveredAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(canConfirmDelivery(order.status) || canOpenDispute(order.status, order.deliveredAt)) && (
                  <div 
                    className="flex gap-3 p-4 border-t"
                    style={{ borderColor: colors.border.primary }}
                  >
                    {canConfirmDelivery(order.status) && (
                      <button
                        onClick={() => handleConfirmDelivery(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{
                          backgroundColor: "#22c55e",
                          color: "white"
                        }}
                      >
                        {actionLoading === order.id ? "Processing..." : "Confirm Delivery"}
                      </button>
                    )}

                    {canOpenDispute(order.status, order.deliveredAt) && (
                      <button
                        onClick={() => handleOpenDispute(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white"
                        }}
                      >
                        {actionLoading === order.id ? "Processing..." : "Open Dispute"}
                      </button>
                    )}
                  </div>
                )}

                {/* Info for completed/disputed orders */}
                {order.status === 2 && (
                  <div 
                    className="p-4 border-t text-sm"
                    style={{ borderColor: colors.border.primary, color: colors.text.tertiary }}
                  >
                    💡 Funds will be released to charity 14 days after delivery confirmation if no dispute is opened.
                  </div>
                )}

                {order.status === 3 && (
                  <div 
                    className="p-4 border-t text-sm"
                    style={{ borderColor: colors.border.primary, color: "#22c55e" }}
                  >
                    ✅ Funds have been released to {order.charityName}
                  </div>
                )}

                {order.status === 4 && (
                  <div 
                    className="p-4 border-t text-sm"
                    style={{ borderColor: colors.border.primary, color: "#ef4444" }}
                  >
                    ⚠️ Dispute is being reviewed by admin
                  </div>
                )}

                {order.status === 5 && (
                  <div 
                    className="p-4 border-t text-sm"
                    style={{ borderColor: colors.border.primary, color: colors.text.tertiary }}
                  >
                    💰 You have been refunded {order.amount} ETH
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}