import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || !ethers.isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Check if charity exists
    const isVerified = await contract.verifiedCharities(address);
    if (!isVerified) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 });
    }

    // Get charity details
    const charityCount = await contract.getCharityCount();
    let charityData = null;

    for (let i = 0; i < charityCount; i++) {
      const charity = await contract.getCharity(i);
      if (charity.charityAddress.toLowerCase() === address.toLowerCase()) {
        // Fetch metadata
        let metadata = { name: "Unknown Charity", description: "", image: "" };
        try {
          if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
            const metadataURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const response = await fetch(metadataURL, { next: { revalidate: 60 } });
            if (response.ok) {
              metadata = await response.json();
            }
          }
        } catch (e) {
          console.error("Failed to fetch charity metadata:", e);
        }

        charityData = {
          id: i,
          address: charity.charityAddress,
          name: metadata.name || "Unknown Charity",
          description: metadata.description || "",
          image: metadata.image ? metadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
          totalReceived: ethers.formatEther(charity.totalReceived),
          isVerified: charity.isVerified
        };
        break;
      }
    }

    if (!charityData) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 });
    }

    // Get charity's goals
    const allGoals = await contract.getAllGoals();
    const charityGoals = [];

    for (const goal of allGoals) {
      if (goal.charity.toLowerCase() === address.toLowerCase()) {
        let goalMetadata = { title: "Untitled Goal", description: "", image: "" };
        try {
          if (goal.metadataURI && goal.metadataURI.startsWith("ipfs://")) {
            const metadataURL = goal.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const response = await fetch(metadataURL, { next: { revalidate: 60 } });
            if (response.ok) {
              goalMetadata = await response.json();
            }
          }
        } catch (e) {
          console.error("Failed to fetch goal metadata:", e);
        }

        const targetAmount = ethers.formatEther(goal.targetAmount);
        const currentAmount = ethers.formatEther(goal.currentAmount);
        const progress = parseFloat(targetAmount) > 0
          ? (parseFloat(currentAmount) / parseFloat(targetAmount)) * 100
          : 0;

        charityGoals.push({
          id: Number(goal.id),
          title: goalMetadata.title || "Untitled Goal",
          description: goalMetadata.description || "",
          image: goalMetadata.image ? goalMetadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
          targetAmount,
          currentAmount,
          progress: Math.min(progress, 100),
          status: Number(goal.status),
          deadline: Number(goal.deadline)
        });
      }
    }

    // Get listings for this charity
    const listingCount = await contract.listingCount();
    const charityListings = [];

    for (let i = 0; i < listingCount; i++) {
      const listing = await contract.getListing(i);
      
      if (listing.charity.toLowerCase() === address.toLowerCase()) {
        let listingMetadata = { name: "Unknown Item", description: "", image: "" };
        try {
          if (listing.metadataURI && listing.metadataURI.startsWith("ipfs://")) {
            const metadataURL = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const response = await fetch(metadataURL, { next: { revalidate: 60 } });
            if (response.ok) {
              listingMetadata = await response.json();
            }
          }
        } catch (e) {
          console.error("Failed to fetch listing metadata:", e);
        }

        charityListings.push({
          id: i,
          name: listingMetadata.name || "Unknown Item",
          description: listingMetadata.description || "",
          image: listingMetadata.image ? listingMetadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
          price: ethers.formatEther(listing.price),
          category: Number(listing.category),
          status: Number(listing.status),
          seller: listing.seller,
          charity: listing.charity
        });
      }
    }

    return NextResponse.json({
      charity: charityData,
      goals: charityGoals,
      listings: charityListings
    });

  } catch (error) {
    console.error("Error fetching charity data:", error);
    return NextResponse.json({ error: "Failed to fetch charity data" }, { status: 500 });
  }
}