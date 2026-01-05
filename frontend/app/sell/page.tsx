"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";
import { useCharities } from "@/app/hooks/useCharities";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";
import { CategoryNames, CategoryRoutes } from "@/app/types";

function SellForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCharity = searchParams.get("charity") || "";
  
  const { isConnected, connect, getSigner } = useWallet();
  const { charities, loading: charitiesLoading } = useCharities();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
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

      setStatus("Creating listing on blockchain...");

      const signer = await getSigner();
      if (!signer) {
        throw new Error("Failed to get wallet signer");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const priceInWei = ethers.parseEther(formData.price);
      
      const tx = await contract.createListing(
        metadataURI,
        priceInWei,
        formData.category,
        formData.charityAddress
      );

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Listing created successfully!");
      
      setTimeout(() => {
        router.push(`/categories/${CategoryRoutes[formData.category]}`);
      }, 2000);

    } catch (error: unknown) {
      console.error("Error creating listing:", error);
      setStatus(error instanceof Error ? error.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text.primary }}>
        Sell an Item
      </h1>

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
            placeholder="e.g., Vintage Leather Jacket"
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
            rows={4}
            className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder="Describe your item in detail..."
          />
        </div>

        {/* Item Details Section */}
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
                placeholder="e.g., M, 42, 10x12"
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
                placeholder="e.g., Black, Navy Blue"
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
                placeholder="e.g., Nike, IKEA"
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2 font-medium" style={{ color: colors.text.primary }}>
            Price (ETH) *
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
              color: colors.text.primary
            }}
            placeholder="0.01"
          />
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
            Select Charity *
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
          {formData.charityAddress && (
            <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
              Proceeds will go to this charity after purchase is confirmed
            </p>
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
            backgroundColor: colors.button.primary,
            color: colors.background.primary
          }}
        >
          {!isConnected 
            ? "Connect Wallet to Sell" 
            : isSubmitting 
              ? "Creating Listing..." 
              : "Create Listing"
          }
        </button>
      </form>
    </div>
  );
}

export default function SellPage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <p style={{ color: colors.text.primary }}>Loading...</p>
        </div>
      }>
        <SellForm />
      </Suspense>
    </div>
  );
}