"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";
import { GoalStatus, GoalStatusColor } from "@/app/hooks/useGoals";

interface CharityGoal {
  id: number;
  title: string;
  description: string;
  image: string;
  targetAmount: string;
  currentAmount: string;
  progress: number;
  status: number;
  deadline: number;
}

export default function CharityDashboardPage() {
  const { isConnected, connect, address, getSigner } = useWallet();
  const [isCharity, setIsCharity] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<CharityGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  // Create goal form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Status
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Check if user is a verified charity
  useEffect(() => {
    async function checkCharity() {
      if (!address) {
        setIsLoading(false);
        setIsCharity(false);
        return;
      }

      try {
        const response = await fetch(`/api/charity/check?address=${address}`);
        const data = await response.json();
        setIsCharity(data.isCharity);
      } catch (error) {
        console.error("Error checking charity:", error);
        setIsCharity(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkCharity();
  }, [address]);

  // Fetch charity's goals
  const fetchGoals = useCallback(async () => {
    if (!address || !isCharity) return;

    setGoalsLoading(true);
    try {
      const response = await fetch(`/api/charity/goals?address=${address}`);
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setGoalsLoading(false);
    }
  }, [address, isCharity]);

  useEffect(() => {
    if (isCharity) {
      fetchGoals();
    }
  }, [isCharity, fetchGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatus("Uploading goal metadata to IPFS...");

    try {
      // Upload metadata to IPFS
      const metadata = {
        title: goalTitle,
        description: goalDescription
      };

      const metadataResponse = await fetch("/api/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) throw new Error("Failed to upload metadata");

      const { ipfsHash } = await metadataResponse.json();
      const metadataURI = `ipfs://${ipfsHash}`;

      setStatus("Creating goal on blockchain...");

      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const targetInWei = ethers.parseEther(goalTarget);
      const deadlineTimestamp = goalDeadline 
        ? Math.floor(new Date(goalDeadline).getTime() / 1000)
        : 0;

      const tx = await contract.createGoal(metadataURI, targetInWei, deadlineTimestamp);

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Goal created successfully!");
      setGoalTitle("");
      setGoalDescription("");
      setGoalTarget("");
      setGoalDeadline("");
      setShowCreateForm(false);
      
      await fetchGoals();

    } catch (error: unknown) {
      console.error("Error creating goal:", error);
      setStatus(error instanceof Error ? error.message : "Failed to create goal");
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleCancelGoal = async (goalId: number) => {
    if (!confirm("Are you sure you want to cancel this goal?")) return;

    setActionLoading(true);
    setStatus("Cancelling goal...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.cancelGoal(goalId);

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Goal cancelled!");
      await fetchGoals();

    } catch (error: unknown) {
      console.error("Error cancelling goal:", error);
      setStatus(error instanceof Error ? error.message : "Failed to cancel goal");
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const formatDeadline = (timestamp: number) => {
    if (timestamp === 0) return "No deadline";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const activeGoals = goals.filter(g => g.status === 0);
  const completedGoals = goals.filter(g => g.status === 1);
  const cancelledGoals = goals.filter(g => g.status === 2);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p style={{ color: colors.text.primary }}>Loading...</p>
      </div>
    );
  }

  // Not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="mb-4 text-lg" style={{ color: colors.text.primary }}>
          Connect your wallet to access the charity dashboard
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

  // Not a verified charity
  if (!isCharity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="text-5xl mb-4">🏛️</p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
          Charity Dashboard
        </h1>
        <p className="mb-4" style={{ color: colors.text.secondary }}>
          Your wallet is not registered as a verified charity.
        </p>
        <p className="text-sm" style={{ color: colors.text.tertiary }}>
          Contact the platform admin to get your charity verified.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
              Charity Dashboard
            </h1>
            <p className="text-sm" style={{ color: colors.text.tertiary }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
          >
            + Create Goal
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
          >
            {status}
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="w-full max-w-lg mx-4 rounded-lg p-6"
              style={{ backgroundColor: colors.background.primary }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Create Fundraising Goal
              </h2>
              
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    required
                    placeholder="e.g., Winter Shelter Fund"
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                    Description
                  </label>
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe what this goal will fund..."
                    className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                    Target Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                    placeholder="1.0"
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{ backgroundColor: colors.button.secondary, color: colors.text.primary }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-lg font-medium disabled:opacity-50"
                    style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
                  >
                    {actionLoading ? "Creating..." : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Goals */}
        {goalsLoading && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>Loading your goals...</p>
          </div>
        )}

        {/* No Goals Yet */}
        {!goalsLoading && goals.length === 0 && (
          <div 
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: colors.background.primary }}
          >
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-lg mb-2" style={{ color: colors.text.primary }}>
              No fundraising goals yet
            </p>
            <p className="mb-4" style={{ color: colors.text.secondary }}>
              Create your first goal to start raising funds
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
              🎯 Active Goals ({activeGoals.length})
            </h2>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: colors.text.primary }}>
                        {goal.title}
                      </h3>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        {goal.description}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: GoalStatusColor[goal.status] }}
                    >
                      {GoalStatus[goal.status]}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div 
                      className="h-3 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.background.tertiary }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${goal.progress}%`,
                          backgroundColor: goal.progress >= 100 ? "#22c55e" : colors.button.primary
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span style={{ color: colors.text.secondary }}>
                        {goal.currentAmount} / {goal.targetAmount} ETH
                      </span>
                      <span className="ml-2" style={{ color: colors.text.primary }}>
                        ({goal.progress.toFixed(0)}%)
                      </span>
                    </div>
                    <span style={{ color: colors.text.tertiary }}>
                      Deadline: {formatDeadline(goal.deadline)}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border.primary }}>
                    <button
                      onClick={() => handleCancelGoal(goal.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: colors.button.secondary, color: colors.text.primary }}
                    >
                      Cancel Goal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
              ✅ Completed Goals ({completedGoals.length})
            </h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg p-4 opacity-75"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text.primary }}>
                        {goal.title}
                      </h3>
                      <p className="text-sm" style={{ color: "#22c55e" }}>
                        ✓ Raised {goal.currentAmount} ETH
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: GoalStatusColor[goal.status] }}
                    >
                      {GoalStatus[goal.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cancelled Goals */}
        {cancelledGoals.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
              ❌ Cancelled Goals ({cancelledGoals.length})
            </h2>
            <div className="space-y-4">
              {cancelledGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg p-4 opacity-50"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text.primary }}>
                        {goal.title}
                      </h3>
                      <p className="text-sm" style={{ color: colors.text.tertiary }}>
                        Was {goal.progress.toFixed(0)}% funded
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: GoalStatusColor[goal.status] }}
                    >
                      {GoalStatus[goal.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}