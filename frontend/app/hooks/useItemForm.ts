import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

interface FormData {
  name: string;
  description: string;
  price: string;
  category: number;
  charityAddress: string;
  condition: string;
  size: string;
  color: string;
  brand: string;
  gender: string;
  sportType: string;
  equipmentType: string;
  weight: string;
  material: string;
  modelNumber: string;
  storageCapacity: string;
  screenSize: string;
  batteryHealth: string;
  ram: string;
  operatingSystem: string;
}

interface UseItemFormProps {
  mode: "sell" | "donate";
  preselectedCharity?: string;
}

export function useItemForm({ mode, preselectedCharity = "" }: UseItemFormProps) {
  const router = useRouter();
  const { isConnected, connect, getSigner } = useWallet();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category: 0,
    charityAddress: preselectedCharity,
    condition: "",
    size: "",
    color: "",
    brand: "",
    gender: "",
    sportType: "",
    equipmentType: "",
    weight: "",
    material: "",
    modelNumber: "",
    storageCapacity: "",
    screenSize: "",
    batteryHealth: "",
    ram: "",
    operatingSystem: ""
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

  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      // Upload image
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

      // Upload metadata
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageURI,
        condition: formData.condition,
        size: formData.size,
        color: formData.color,
        brand: formData.brand,
        gender: formData.gender,
        sportType: formData.sportType,
        equipmentType: formData.equipmentType,
        weight: formData.weight,
        material: formData.material,
        modelNumber: formData.modelNumber,
        storageCapacity: formData.storageCapacity,
        screenSize: formData.screenSize,
        batteryHealth: formData.batteryHealth,
        ram: formData.ram,
        operatingSystem: formData.operatingSystem
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

      // Blockchain transaction
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Failed to get wallet signer");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      if (mode === "donate") {
        setStatus("Donating item to charity on blockchain...");
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
      } else {
        setStatus("Creating listing on blockchain...");
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
          router.push("/shop");
        }, 2000);
      }

    } catch (error: unknown) {
      console.error(`Error ${mode}ing item:`, error);
      setStatus(error instanceof Error ? error.message : `Failed to ${mode} item`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    image,
    imagePreview,
    isSubmitting,
    status,
    isConnected,
    handleImageChange,
    handleFieldChange,
    handleSubmit
  };
}
