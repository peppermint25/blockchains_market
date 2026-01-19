"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { colors } from "@/app/styles/colors";
import { useGoals, GoalStatus, GoalStatusColor } from "@/app/hooks/useGoals";
import { DisplayListing, CategoryNames } from "@/app/types";
import Link from "next/link";

interface CharityDetails {
  id: number;
  address: string;
  name: string;
  description: string;
  image: string;
  totalReceived: string;
  isVerified: boolean;
}

export default function CharityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const charityAddress = params.address as string;

  const [charity, setCharity] = useState<CharityDetails | null>(null);
  const [donatedItems, setDonatedItems] = useState<DisplayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { goals, loading: goalsLoading } = useGoals();

  // Filter goals for this charity
  const charityGoals = goals.filter(
    (goal) => goal.charity.toLowerCase() === charityAddress.toLowerCase()
  );

  useEffect(() => {
    async function fetchCharityData() {
      try {
        // Fetch charity details
        const charitiesResponse = await fetch("/api/charities");
        const charitiesData = await charitiesResponse.json();

        const foundCharity = charitiesData.charities?.find(
          (c: CharityDetails) => c.address.toLowerCase() === charityAddress.toLowerCase()
        );

        if (!foundCharity) {
          setError("Charity not found");
          setLoading(false);
          return;
        }

        setCharity(foundCharity);

        // Fetch all listings and filter by charity
        const listingsResponse = await fetch("/api/listings");
        const listingsData = await listingsResponse.json();

        // Filter items donated to this charity (sold items with this charity address)
        const charitiesListingsResponse = await fetch(`/api/listings?charity=${charityAddress}`);
        const allListingsResponse = await fetch("/api/listings");

        const allListingsData = await allListingsResponse.json();
        const charityItems = allListingsData.listings?.filter(
          (listing: DisplayListing) =>
            listing.charity.toLowerCase() === charityAddress.toLowerCase()
        ) || [];

        setDonatedItems(charityItems);
      } catch (e) {
        setError("Failed to fetch charity data");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (charityAddress) {
      fetchCharityData();
    }
  }, [charityAddress]);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDeadline = (timestamp: number) => {
    if (timestamp === 0) return "No deadline";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p style={{ color: colors.text.primary }}>Loading charity details...</p>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p className="text-5xl mb-4">😕</p>
        <p className="text-lg mb-4" style={{ color: colors.text.primary }}>
          {error || "Charity not found"}
        </p>
        <button
          onClick={() => router.push("/charities")}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
        >
          Back to Charities
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm hover:opacity-70"
          style={{ color: colors.text.secondary }}
        >
          ← Back
        </button>

        {/* Charity Header */}
        <div
          className="rounded-lg p-8 mb-8"
          style={{ backgroundColor: colors.background.primary }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl overflow-hidden flex-shrink-0"
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

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                  {charity.name}
                </h1>
                {charity.isVerified && (
                  <span className="text-xl" title="Verified Charity">✓</span>
                )}
              </div>

              <p className="text-sm mb-4" style={{ color: colors.text.tertiary }}>
                {formatAddress(charity.address)}
              </p>

              <p className="mb-4" style={{ color: colors.text.secondary }}>
                {charity.description || "Supporting important causes in our community."}
              </p>

              <div className="flex gap-6">
                <div>
                  <p className="text-sm" style={{ color: colors.text.tertiary }}>
                    Total Received
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                    {charity.totalReceived} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.text.tertiary }}>
                    Active Goals
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                    {charityGoals.filter(g => g.status === 0).length}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/sell?charity=${charity.address}`}
                  className="inline-block px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: colors.button.primary,
                    color: colors.background.primary
                  }}
                >
                  Support This Charity
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active Fundraising Goals */}
        {charityGoals.filter(g => g.status === 0).length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
              🎯 Active Fundraising Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charityGoals
                .filter(g => g.status === 0)
                .map((goal) => (
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

        {/* Donated Items */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
            💝 Items Supporting This Charity
          </h2>

          {donatedItems.length === 0 ? (
            <div
              className="text-center py-12 rounded-lg"
              style={{ backgroundColor: colors.background.primary }}
            >
              <p className="text-5xl mb-4">📦</p>
              <p style={{ color: colors.text.secondary }}>
                No items listed for this charity yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {donatedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="rounded-lg overflow-hidden transition-transform hover:scale-105"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <div
                    className="aspect-square relative"
                    style={{ backgroundColor: colors.background.tertiary }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}
                    <span
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: colors.background.primary,
                        color: colors.text.secondary
                      }}
                    >
                      {CategoryNames[item.category]}
                    </span>
                    {item.status === 0 && (
                      <span
                        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: "#22c55e" }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1" style={{ color: colors.text.primary }}>
                      {item.name}
                    </h3>
                    <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                      {item.price} ETH
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
