"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { useCharities } from "@/app/hooks/useCharities";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";
import { CategoryNames } from "@/app/types";

function DonateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCharity = searchParams.get("charity") || "";
  
  const { isConnected, connect, getSigner } = useWallet();
  const { charities, loading: charitiesLoading } = useCharities();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: 0,
    charityAddress: preselectedCharity,
    condition: "",
    size: "",
    color: "",
    brand: ""
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      connect();
      return;
    }

    if (!image) {
      setStatus("Please select an image");
      return;
    }

    if (!formData.charityAddress) {
      setStatus("Please select a charity");
      return;
    }

    setIsSubmitting(true);
    setStatus("Uploading image to IPFS...");

    try {
      const imageFormData = new FormData();
      imageFormData.append("file", image);

      const imageResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { ipfsHash: imageHash } = await imageResponse.json();
      const imageURI = `ipfs://${imageHash}`;

      setStatus("Uploading metadata to IPFS...");

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageURI,
        condition: formData.condition,
        size: formData.size,
        color: formData.color,
        brand: formData.brand
      };

      const metadataResponse = await fetch("/api/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata");
      }

      const { ipfsHash: metadataHash } = await metadataResponse.json();
      const metadataURI = `ipfs://${metadataHash}`;

      setStatus("Donating item to charity on blockchain...");

      const signer = await getSigner();
      if (!signer) {
        throw new Error("Failed to get wallet signer");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.donateItemToCharity(
        metadataURI,
        formData.category,
        formData.charityAddress
      );

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Item donated successfully! Thank you for your generosity! 🎉");
      
      setTimeout(() => {
        router.push("/charities");
      }, 2000);

    } catch (error: unknown) {
      console.error("Error donating item:", error);
      setStatus(error instanceof Error ? error.message : "Failed to donate item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <p className="text-5xl mb-4">💝</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
          Donate an Item
        </h1>
        <p style={{ color: colors.text.secondary }}>
          Give directly to a charity - no sale needed
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Item Image *
          </label>
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80"
            style={{ borderColor: colors.border.primary, backgroundColor: colors.background.primary }}
            onClick={() => document.getElementById("image-input")?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <div style={{ color: colors.text.tertiary }}>
                <p className="text-4xl mb-2">📷</p>
                <p>Click to upload image</p>
              </div>
            )}
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder="e.g., Winter Jacket"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder="Describe the item you're donating..."
          />
        </div>

        {/* Item Details */}
        <div 
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.background.primary }}
        >
          <h3 className="font-medium mb-4" style={{ color: colors.text.primary }}>
            Item Details (Optional)
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm" style={{ color: colors.text.secondary }}>
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary,
                  color: colors.text.primary
                }}
              >
                <option value="">Select condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm" style={{ color: colors.text.secondary }}>
                Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary,
                  color: colors.text.primary
                }}
                placeholder="e.g., M, 42"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm" style={{ color: colors.text.secondary }}>
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary,
                  color: colors.text.primary
                }}
                placeholder="e.g., Black"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm" style={{ color: colors.text.secondary }}>
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary,
                  color: colors.text.primary
                }}
                placeholder="e.g., Nike"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
          >
            {Object.entries(CategoryNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Charity Selection */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Donate To *
          </label>
          {charitiesLoading ? (
            <p style={{ color: colors.text.tertiary }}>Loading charities...</p>
          ) : charities.length === 0 ? (
            <p style={{ color: colors.text.tertiary }}>No verified charities available</p>
          ) : (
            <select
              value={formData.charityAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, charityAddress: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ 
                backgroundColor: colors.background.primary,
                borderColor: colors.border.primary,
                color: colors.text.primary
              }}
            >
              <option value="">-- Select a charity --</option>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.address}>
                  {charity.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Status Message */}
        {status && (
          <div 
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: colors.background.primary, color: colors.text.secondary }}
          >
            {status}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (charities.length === 0)}
          className="w-full py-4 rounded-lg font-medium text-lg transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: "#22c55e",
            color: "white"
          }}
        >
          {!isConnected 
            ? "Connect Wallet to Donate" 
            : isSubmitting 
              ? "Donating Item..." 
              : "💝 Donate Item"
          }
        </button>
      </form>
    </div>
  );
}

export default function DonatePage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <p style={{ color: colors.text.primary }}>Loading...</p>
        </div>
      }>
        <DonateForm />
      </Suspense>
    </div>
  );
}