"use client";
import { useState, useEffect } from "react";

export interface Charity {
  id: number;
  address: string;
  name: string;
  description: string;
  image: string;
  totalReceived: string;
  isVerified: boolean;
}

export function useCharities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharities() {
      try {
        const response = await fetch("/api/charities");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setCharities(data.charities);
        }
      } catch (e) {
        setError("Failed to fetch charities");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchCharities();
  }, []);

  return { charities, loading, error };
}