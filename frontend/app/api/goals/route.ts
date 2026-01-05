import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const goals = await contract.getAllGoals();
    const charityCount = await contract.getCharityCount();

    // Build charity lookup
    const charityLookup: Record<string, string> = {};
    for (let i = 0; i < charityCount; i++) {
      const charity = await contract.getCharity(i);
      let name = "Unknown Charity";
      try {
        if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
          const metadataURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          if (response.ok) {
            const metadata = await response.json();
            name = metadata.name || "Unknown Charity";
          }
        } else if (charity.metadataURI) {
          name = charity.metadataURI;
        }
      } catch (e) {
        console.error("Failed to fetch charity metadata:", e);
      }
      charityLookup[charity.charityAddress.toLowerCase()] = name;
    }

    const formattedGoals = [];

    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];

      // Fetch goal metadata from IPFS
      let metadata = { title: "Untitled Goal", description: "", image: "" };
      try {
        if (goal.metadataURI && goal.metadataURI.startsWith("ipfs://")) {
          const metadataURL = goal.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          if (response.ok) {
            metadata = await response.json();
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

      formattedGoals.push({
        id: Number(goal.id),
        charity: goal.charity,
        charityName: charityLookup[goal.charity.toLowerCase()] || "Unknown Charity",
        title: metadata.title || "Untitled Goal",
        description: metadata.description || "",
        image: metadata.image ? metadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
        targetAmount,
        currentAmount,
        progress: Math.min(progress, 100),
        status: Number(goal.status), // 0: Active, 1: Completed, 2: Cancelled
        deadline: Number(goal.deadline)
      });
    }

    return NextResponse.json({ goals: formattedGoals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals", goals: [] }, { status: 500 });
  }
}