"use client";
import { useState, useEffect, useCallback } from "react";

export interface MyListing {
  id: number;
  seller: string;
  name: string;
  description: string;
  image: string;
  price: string;
  category: number;
  status: number;
  charity: string;
}

export interface SellerOrder {
  id: number;
  listingId: number;
  buyer: string;
  amount: string;
  status: number;
  shippedAt: number;
  deliveredAt: number;
  item: {
    name: string;
    image: string;
  };
}

export const ListingStatus: Record<number, string> = {
  0: "Active",
  1: "Sold",
  2: "Cancelled"
};

export const ListingStatusColor: Record<number, string> = {
  0: "#22c55e",
  1: "#3b82f6",
  2: "#6b7280"
};

export function useMyListings(address: string | null) {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear data immediately when address is null
    if (!address) {
      setListings([]);
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/my-listings?address=${address}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setListings([]);
          setOrders([]);
        } else {
          setListings(data.listings || []);
          setOrders(data.orders || []);
        }
      } catch (e) {
        setError("Failed to fetch data");
        setListings([]);
        setOrders([]);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address]);

  const refetch = useCallback(async () => {
    if (!address) {
      setListings([]);
      setOrders([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/my-listings?address=${address}`);
      const data = await response.json();
      if (!data.error) {
        setListings(data.listings || []);
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  return { listings, orders, loading, error, refetch };
}