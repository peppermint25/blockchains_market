"use client";
import { useState, useEffect } from "react";

export interface Goal {
  id: number;
  charity: string;
  charityName: string;
  title: string;
  description: string;
  image: string;
  targetAmount: string;
  currentAmount: string;
  progress: number;
  status: number;
  deadline: number;
}

export const GoalStatus: Record<number, string> = {
  0: "Active",
  1: "Completed",
  2: "Cancelled"
};

export const GoalStatusColor: Record<number, string> = {
  0: "#22c55e", // Green - Active
  1: "#3b82f6", // Blue - Completed
  2: "#6b7280"  // Gray - Cancelled
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/goals");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setGoals([]);
        } else {
          setGoals(data.goals || []);
        }
      } catch (e) {
        setError("Failed to fetch goals");
        setGoals([]);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, []);

  return { goals, loading, error };
}