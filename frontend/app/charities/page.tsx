"use client";

import { colors } from "@/app/styles/colors";
import { useCharities } from "@/app/hooks/useCharities";
import { useGoals, GoalStatus, GoalStatusColor } from "@/app/hooks/useGoals";
import Link from "next/link";

export default function CharitiesPage() {
  const { charities, loading: charitiesLoading } = useCharities();
  const { goals, loading: goalsLoading } = useGoals();

  const activeGoals = goals.filter((g) => g.status === 0);
  const completedGoals = goals.filter((g) => g.status === 1);

  const formatDeadline = (timestamp: number) => {
    if (timestamp === 0) return "No deadline";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isLoading = charitiesLoading || goalsLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
            Charities & Goals
          </h1>
          <p style={{ color: colors.text.tertiary }}>
            Support verified charities and track fundraising progress
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>Loading...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Active Fundraising Goals */}
            {activeGoals.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
                  🎯 Active Fundraising Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-lg overflow-hidden"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="h-40 relative"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {goal.image ? (
                          <img
                            src={goal.image}
                            alt={goal.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🎯
                          </div>
                        )}
                        <span
                          className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: GoalStatusColor[goal.status] }}
                        >
                          {GoalStatus[goal.status]}
                        </span>
                      </div>

                      <div className="p-4">
                        <p className="text-sm mb-1" style={{ color: colors.text.tertiary }}>
                          {goal.charityName}
                        </p>
                        <h3 className="font-bold text-lg mb-2" style={{ color: colors.text.primary }}>
                          {goal.title}
                        </h3>
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.text.secondary }}>
                          {goal.description || "Help us reach our fundraising goal!"}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-2">
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

                        <div className="flex justify-between text-sm mb-2">
                          <span style={{ color: colors.text.secondary }}>
                            {goal.currentAmount} ETH raised
                          </span>
                          <span style={{ color: colors.text.primary }}>
                            {goal.progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span style={{ color: colors.text.tertiary }}>
                            Goal: {goal.targetAmount} ETH
                          </span>
                          <span style={{ color: colors.text.tertiary }}>
                            Deadline: {formatDeadline(goal.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
                  ✅ Completed Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-lg overflow-hidden opacity-75"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div 
                        className="h-32 relative"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {goal.image ? (
                          <img
                            src={goal.image}
                            alt={goal.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            ✅
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                          {goal.charityName}
                        </p>
                        <h3 className="font-bold mb-1" style={{ color: colors.text.primary }}>
                          {goal.title}
                        </h3>
                        <p className="text-sm" style={{ color: "#22c55e" }}>
                          ✓ Raised {goal.currentAmount} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Verified Charities */}
            <section>
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
                🏛️ Verified Charities
              </h2>
              
              {charities.length === 0 ? (
                <div 
                  className="text-center py-8 rounded-lg"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <p style={{ color: colors.text.secondary }}>No verified charities yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {charities.map((charity) => (
                    <div
                      key={charity.id}
                      className="rounded-lg p-6"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl overflow-hidden"
                          style={{ backgroundColor: colors.background.tertiary }}
                        >
                          {charity.image ? (
                            <img
                              src={charity.image}
                              alt={charity.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>🏛️</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: colors.text.primary }}>
                            {charity.name}
                          </h3>
                          <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            {charity.address.slice(0, 6)}...{charity.address.slice(-4)}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                        {charity.description || "Supporting important causes in our community."}
                      </p>

                      <div 
                        className="flex justify-between items-center pt-4 border-t"
                        style={{ borderColor: colors.border.primary }}
                      >
                        <div>
                          <p className="text-xs" style={{ color: colors.text.tertiary }}>
                            Total Received
                          </p>
                          <p className="font-bold" style={{ color: colors.text.primary }}>
                            {charity.totalReceived} ETH
                          </p>
                        </div>
                        <Link
                          href={`/sell?charity=${charity.address}`}
                          className="px-4 py-2 rounded-lg text-sm font-medium"
                          style={{
                            backgroundColor: colors.button.primary,
                            color: colors.background.primary
                          }}
                        >
                          Support
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}