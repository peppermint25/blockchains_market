"use client";
import { useState, useEffect } from "react";
import { DisplayListing } from "@/app/types";

export function useListings(categoryFilter?: number) {
  const [listings, setListings] = useState<DisplayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      try {
        const url = categoryFilter !== undefined 
          ? `/api/listings?category=${categoryFilter}`
          : `/api/listings`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setListings([]);
        } else {
          setListings(data.listings || []);
        }
      } catch (e) {
        setError("Failed to fetch listings");
        setListings([]);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [categoryFilter]);

  return { listings, loading, error };
}