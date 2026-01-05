import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const charityCount = await contract.getCharityCount();
    const charities = [];

    for (let i = 0; i < charityCount; i++) {
      const charity = await contract.getCharity(i);
      
      // Only include verified charities
      if (!charity.isVerified) continue;

      // Fetch metadata from IPFS
      let metadata = { name: "Unknown Charity", description: "" };
      try {
        if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
          const metadataURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          metadata = await response.json();
        }
      } catch (e) {
        console.error("Failed to fetch charity metadata:", e);
      }

      charities.push({
        id: i,
        address: charity.charityAddress,
        name: metadata.name || "Unknown Charity",
        description: metadata.description || "",
        totalReceived: ethers.formatEther(charity.totalReceived),
        isVerified: charity.isVerified
      });
    }

    return NextResponse.json({ charities });
  } catch (error) {
    console.error("Error fetching charities:", error);
    return NextResponse.json({ error: "Failed to fetch charities", charities: [] }, { status: 500 });
  }
}