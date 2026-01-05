"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { useMyListings, ListingStatus, ListingStatusColor } from "@/app/hooks/useMyListings";
import { OrderStatus, OrderStatusColor } from "@/app/hooks/useOrders";
import { CategoryNames } from "@/app/types";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

export default function MyListingsPage() {
  const { isConnected, connect, address, getSigner } = useWallet();
  const { listings, orders, loading, error, refetch } = useMyListings(address);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const handleConfirmShipment = async (orderId: number) => {
    setActionLoading(orderId);
    setActionStatus("Confirming shipment...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.confirmShipment(orderId);
      
      setActionStatus("Waiting for confirmation...");
      await tx.wait();

      setActionStatus("Shipment confirmed!");
      await refetch();
    } catch (error: unknown) {
      console.error("Error confirming shipment:", error);
      setActionStatus(error instanceof Error ? error.message : "Failed to confirm shipment");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleCancelListing = async (listingId: number) => {
    if (!confirm("Are you sure you want to cancel this listing?")) return;

    setActionLoading(listingId);
    setActionStatus("Cancelling listing...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.cancelListing(listingId);
      
      setActionStatus("Waiting for confirmation...");
      await tx.wait();

      setActionStatus("Listing cancelled!");
      await refetch();
    } catch (error: unknown) {
      console.error("Error cancelling listing:", error);
      setActionStatus(error instanceof Error ? error.message : "Failed to cancel listing");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const pendingShipments = orders.filter(o => o.status === 0);
  const activeListings = listings.filter(l => l.status === 0);
  const soldListings = listings.filter(l => l.status === 1);

  console.log("is connected:", isConnected);

    if (!isConnected || !address) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="mb-4 text-lg" style={{ color: colors.text.primary }}>
            Connect your wallet to view your listings
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
            My Listings {isConnected }
          </h1>
          <Link
            href="/sell"
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
          >
            + New Listing
          </Link>
        </div>

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
            <p style={{ color: colors.text.secondary }}>Loading your listings...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Pending Shipments Alert */}
            {pendingShipments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
                  Pending Shipments ({pendingShipments.length})
                </h2>
                <div className="space-y-4">
                  {pendingShipments.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {order.item.image ? (
                          <img
                            src={order.item.image}
                            alt={order.item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold" style={{ color: colors.text.primary }}>
                          {order.item.name}
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                          Buyer: {order.buyer.slice(0, 6)}...{order.buyer.slice(-4)}
                        </p>
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          {order.amount} ETH
                        </p>
                      </div>

                      <button
                        onClick={() => handleConfirmShipment(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "#22c55e", color: "white" }}
                      >
                        {actionLoading === order.id ? "Processing..." : "Confirm Shipment"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Listings */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Active Listings ({activeListings.length})
              </h2>
              
              {activeListings.length === 0 ? (
                <div 
                  className="text-center py-8 rounded-lg"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <p className="mb-4" style={{ color: colors.text.secondary }}>
                    You don&apos;t have any active listings
                  </p>
                  <Link
                    href="/sell"
                    className="px-4 py-2 rounded-lg font-medium inline-block"
                    style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
                  >
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-lg overflow-hidden"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="h-40 relative"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                        )}
                        <span
                          className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: ListingStatusColor[listing.status] }}
                        >
                          {ListingStatus[listing.status]}
                        </span>
                        <span
                          className="absolute top-2 right-2 px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
                        >
                          {CategoryNames[listing.category]}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: colors.text.primary }}>
                          {listing.name}
                        </h3>
                        <p className="text-lg font-bold mb-3" style={{ color: colors.text.primary }}>
                          {listing.price} ETH
                        </p>
                        <button
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="w-full py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 text-sm"
                          style={{ backgroundColor: colors.button.secondary, color: colors.text.primary }}
                        >
                          {actionLoading === listing.id ? "Processing..." : "Cancel Listing"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sold Items */}
            {soldListings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                  Sold Items ({soldListings.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {soldListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-lg overflow-hidden opacity-75"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="h-32 relative"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}
                        <span
                          className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: ListingStatusColor[listing.status] }}
                        >
                          {ListingStatus[listing.status]}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: colors.text.primary }}>
                          {listing.name}
                        </h3>
                        <p className="font-bold" style={{ color: colors.text.secondary }}>
                          {listing.price} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Orders for Seller */}
            {orders.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                  All Orders ({orders.length})
                </h2>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="w-12 h-12 rounded overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {order.item.image ? (
                          <img
                            src={order.item.image}
                            alt={order.item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">📦</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: colors.text.primary }}>
                          {order.item.name}
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                          {order.amount} ETH
                        </p>
                      </div>

                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: OrderStatusColor[order.status] }}
                      >
                        {OrderStatus[order.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}