"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

interface Charity {
  id: number;
  address: string;
  metadataURI: string;
  name: string;
  description: string;
  image: string;
  isVerified: boolean;
  totalReceived: string;
}

interface Dispute {
  orderId: number;
  listingId: number;
  buyer: string;
  seller: string;
  charity: string;
  amount: string;
  reason: string;
  item: {
    name: string;
    description: string;
    image: string;
  };
}

export default function AdminPage() {
  const { isConnected, connect, getSigner, address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"charities" | "disputes">("charities");

  // Charities state
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);

  // Add charity form
  const [newCharityAddress, setNewCharityAddress] = useState("");
  const [newCharityName, setNewCharityName] = useState("");
  const [newCharityDescription, setNewCharityDescription] = useState("");

  // Edit charity form
  const [editCharityName, setEditCharityName] = useState("");
  const [editCharityDescription, setEditCharityDescription] = useState("");
  const [editCharityVerified, setEditCharityVerified] = useState(true);

  // Disputes state
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  // Status messages
  const [status, setStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if admin
  useEffect(() => {
    async function checkAdmin() {
      if (!address) {
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin?address=${address}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [address]);

  // Fetch charities
  useEffect(() => {
    async function fetchCharities() {
      if (!isAdmin) return;
      
      setCharitiesLoading(true);
      try {
        const response = await fetch("/api/admin/charities");
        const data = await response.json();
        setCharities(data.charities || []);
      } catch (error) {
        console.error("Error fetching charities:", error);
      } finally {
        setCharitiesLoading(false);
      }
    }

    if (activeTab === "charities") {
      fetchCharities();
    }
  }, [isAdmin, activeTab]);

  // Fetch disputes
  useEffect(() => {
    async function fetchDisputes() {
      if (!isAdmin) return;
      
      setDisputesLoading(true);
      try {
        const response = await fetch("/api/admin/disputes");
        const data = await response.json();
        setDisputes(data.disputes || []);
      } catch (error) {
        console.error("Error fetching disputes:", error);
      } finally {
        setDisputesLoading(false);
      }
    }

    if (activeTab === "disputes") {
      fetchDisputes();
    }
  }, [isAdmin, activeTab]);

  const handleAddCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatus("Uploading charity metadata to IPFS...");

    try {
      // Upload metadata to IPFS
      const metadata = {
        name: newCharityName,
        description: newCharityDescription
      };

      const metadataResponse = await fetch("/api/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) throw new Error("Failed to upload metadata");

      const { ipfsHash } = await metadataResponse.json();
      const metadataURI = `ipfs://${ipfsHash}`;

      setStatus("Adding charity to blockchain...");

      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addCharity(newCharityAddress, metadataURI);

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Charity added successfully!");
      setNewCharityAddress("");
      setNewCharityName("");
      setNewCharityDescription("");

      // Refresh charities list
      const response = await fetch("/api/admin/charities");
      const data = await response.json();
      setCharities(data.charities || []);

    } catch (error: unknown) {
      console.error("Error adding charity:", error);
      setStatus(error instanceof Error ? error.message : "Failed to add charity");
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleEditCharity = (charity: Charity) => {
    setEditingCharity(charity);
    setEditCharityName(charity.name === "No name set" ? "" : charity.name);
    setEditCharityDescription(charity.description === "No description set" ? "" : charity.description);
    setEditCharityVerified(charity.isVerified);
  };

  const handleUpdateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity) return;

    setActionLoading(true);
    setStatus("Uploading updated metadata to IPFS...");

    try {
      // Upload new metadata to IPFS
      const metadata = {
        name: editCharityName,
        description: editCharityDescription
      };

      const metadataResponse = await fetch("/api/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) throw new Error("Failed to upload metadata");

      const { ipfsHash } = await metadataResponse.json();
      const metadataURI = `ipfs://${ipfsHash}`;

      setStatus("Updating charity on blockchain...");

      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.updateCharity(editingCharity.address, metadataURI, editCharityVerified);

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Charity updated successfully!");
      setEditingCharity(null);

      // Refresh charities list
      const response = await fetch("/api/admin/charities");
      const data = await response.json();
      setCharities(data.charities || []);

    } catch (error: unknown) {
      console.error("Error updating charity:", error);
      setStatus(error instanceof Error ? error.message : "Failed to update charity");
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleResolveDispute = async (orderId: number, refundBuyer: boolean) => {
    const action = refundBuyer ? "refund the buyer" : "release funds to charity";
    if (!confirm(`Are you sure you want to ${action}?`)) return;

    setActionLoading(true);
    setStatus(refundBuyer ? "Processing refund..." : "Releasing funds to charity...");

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.resolveDispute(orderId, refundBuyer);

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Dispute resolved successfully!");

      // Refresh disputes list
      const response = await fetch("/api/admin/disputes");
      const data = await response.json();
      setDisputes(data.disputes || []);

    } catch (error: unknown) {
      console.error("Error resolving dispute:", error);
      setStatus(error instanceof Error ? error.message : "Failed to resolve dispute");
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
        <p className="mb-4" style={{ color: colors.text.primary }}>Connect your wallet to access admin panel</p>
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

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p style={{ color: colors.text.primary }}>You are not authorized to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text.primary }}>
          Admin Panel
        </h1>

        {/* Status Message */}
        {status && (
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
          >
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("charities")}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: activeTab === "charities" ? colors.button.primary : colors.button.secondary,
              color: activeTab === "charities" ? colors.background.primary : colors.text.primary
            }}
          >
            Charities ({charities.length})
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: activeTab === "disputes" ? colors.button.primary : colors.button.secondary,
              color: activeTab === "disputes" ? colors.background.primary : colors.text.primary
            }}
          >
            Disputes ({disputes.length})
          </button>
        </div>

        {/* Charities Tab */}
        {activeTab === "charities" && (
          <div className="space-y-8">
            {/* Add New Charity */}
            <div className="rounded-lg p-6" style={{ backgroundColor: colors.background.primary }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Add New Charity
              </h2>
              <form onSubmit={handleAddCharity} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newCharityAddress}
                    onChange={(e) => setNewCharityAddress(e.target.value)}
                    required
                    placeholder="0x..."
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
                    Charity Name
                  </label>
                  <input
                    type="text"
                    value={newCharityName}
                    onChange={(e) => setNewCharityName(e.target.value)}
                    required
                    placeholder="e.g., Red Cross Latvia"
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
                    value={newCharityDescription}
                    onChange={(e) => setNewCharityDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe the charity..."
                    className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                    style={{ 
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.button.primary, color: colors.background.primary }}
                >
                  {actionLoading ? "Processing..." : "Add Charity"}
                </button>
              </form>
            </div>

            {/* Existing Charities */}
            <div className="rounded-lg p-6" style={{ backgroundColor: colors.background.primary }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Existing Charities
              </h2>

              {charitiesLoading ? (
                <p style={{ color: colors.text.secondary }}>Loading charities...</p>
              ) : charities.length === 0 ? (
                <p style={{ color: colors.text.secondary }}>No charities added yet</p>
              ) : (
                <div className="space-y-4">
                  {charities.map((charity) => (
                    <div 
                      key={charity.id}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: colors.border.primary, backgroundColor: colors.background.secondary }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold" style={{ color: colors.text.primary }}>
                            {charity.name}
                          </h3>
                          <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            {formatAddress(charity.address)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: charity.isVerified ? "#22c55e" : "#ef4444",
                              color: "white"
                            }}
                          >
                            {charity.isVerified ? "Verified" : "Unverified"}
                          </span>
                          <button
                            onClick={() => handleEditCharity(charity)}
                            className="px-3 py-1 rounded text-sm font-medium"
                            style={{ backgroundColor: colors.button.secondary, color: colors.text.primary }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                        {charity.description}
                      </p>
                      <p className="text-sm" style={{ color: colors.text.tertiary }}>
                        Total received: {charity.totalReceived} ETH
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Charity Modal */}
            {editingCharity && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div 
                  className="w-full max-w-md mx-4 rounded-lg p-6"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                    Edit Charity
                  </h2>
                  <p className="text-sm mb-4" style={{ color: colors.text.tertiary }}>
                    {formatAddress(editingCharity.address)}
                  </p>
                  <form onSubmit={handleUpdateCharity} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={editCharityName}
                        onChange={(e) => setEditCharityName(e.target.value)}
                        required
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
                        value={editCharityDescription}
                        onChange={(e) => setEditCharityDescription(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                        style={{ 
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.primary,
                          color: colors.text.primary
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={editCharityVerified}
                        onChange={(e) => setEditCharityVerified(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="verified" className="text-sm" style={{ color: colors.text.primary }}>
                        Verified charity
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingCharity(null)}
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
                        {actionLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <div className="rounded-lg p-6" style={{ backgroundColor: colors.background.primary }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
              Open Disputes
            </h2>

            {disputesLoading ? (
              <p style={{ color: colors.text.secondary }}>Loading disputes...</p>
            ) : disputes.length === 0 ? (
              <p style={{ color: colors.text.secondary }}>No open disputes 🎉</p>
            ) : (
              <div className="space-y-6">
                {disputes.map((dispute) => (
                  <div 
                    key={dispute.orderId}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: colors.border.primary, backgroundColor: colors.background.secondary }}
                  >
                    <div className="flex gap-4 mb-4">
                      <div 
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: colors.background.tertiary }}
                      >
                        {dispute.item.image ? (
                          <img
                            src={dispute.item.image}
                            alt={dispute.item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1" style={{ color: colors.text.primary }}>
                          {dispute.item.name}
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          Order #{dispute.orderId} • {dispute.amount} ETH
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Buyer: </span>
                        <span style={{ color: colors.text.primary }}>{formatAddress(dispute.buyer)}</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.tertiary }}>Seller: </span>
                        <span style={{ color: colors.text.primary }}>{formatAddress(dispute.seller)}</span>
                      </div>
                    </div>

                    <div 
                      className="p-3 rounded-lg mb-4"
                      style={{ backgroundColor: colors.background.primary }}
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: colors.text.tertiary }}>
                        Dispute Reason:
                      </p>
                      <p style={{ color: colors.text.primary }}>
                        {dispute.reason || "No reason provided"}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResolveDispute(dispute.orderId, true)}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "#ef4444", color: "white" }}
                      >
                        Refund Buyer
                      </button>
                      <button
                        onClick={() => handleResolveDispute(dispute.orderId, false)}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "#22c55e", color: "white" }}
                      >
                        Release to Charity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}