"use client";
import { useState, useEffect, useCallback } from "react";

export interface Order {
  id: number;
  listingId: number;
  buyer: string;
  seller: string;
  charity: string;
  charityName: string;
  amount: string;
  status: number;
  shippedAt: number;
  deliveredAt: number;
  item: {
    name: string;
    description: string;
    image: string;
  };
}

export const OrderStatus: Record<number, string> = {
  0: "Awaiting Shipment",
  1: "Shipped",
  2: "Delivered",
  3: "Completed",
  4: "Disputed",
  5: "Refunded"
};

export const OrderStatusColor: Record<number, string> = {
  0: "#f59e0b",
  1: "#3b82f6",
  2: "#8b5cf6",
  3: "#22c55e",
  4: "#ef4444",
  5: "#6b7280"
};

export function useOrders(address: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear data immediately when address is null
    if (!address) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders?address=${address}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setOrders([]);
        } else {
          setOrders(data.orders || []);
        }
      } catch (e) {
        setError("Failed to fetch orders");
        setOrders([]);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [address]);

  const refetch = useCallback(async () => {
    if (!address) {
      setOrders([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders?address=${address}`);
      const data = await response.json();
      if (!data.error) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  return { orders, loading, error, refetch };
}