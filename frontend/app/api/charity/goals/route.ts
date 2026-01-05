import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required", goals: [] }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Check if address is a verified charity
    const isVerified = await contract.verifiedCharities(address);
    if (!isVerified) {
      return NextResponse.json({ error: "Not a verified charity", goals: [], isVerified: false });
    }

    // Get charity's goal IDs
    const goalIds = await contract.getCharityGoals(address);
    const goals = [];

    for (const goalId of goalIds) {
      const allGoals = await contract.getAllGoals();
      const goal = allGoals.find((g: { id: bigint }) => Number(g.id) === Number(goalId));
      
      if (!goal) continue;

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

      goals.push({
        id: Number(goal.id),
        title: metadata.title || "Untitled Goal",
        description: metadata.description || "",
        image: metadata.image ? metadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
        targetAmount,
        currentAmount,
        progress: Math.min(progress, 100),
        status: Number(goal.status),
        deadline: Number(goal.deadline)
      });
    }

    return NextResponse.json({ goals: goals.reverse(), isVerified: true });
  } catch (error) {
    console.error("Error fetching charity goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals", goals: [] }, { status: 500 });
  }
}