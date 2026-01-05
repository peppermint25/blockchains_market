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

      // Fetch metadata from IPFS if available
      let metadata = { name: "", description: "", image: "" };
      try {
        if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
          const metadataURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          if (response.ok) {
            metadata = await response.json();
          }
        } else if (charity.metadataURI && !charity.metadataURI.startsWith("ipfs://")) {
          // Plain text metadata
          metadata.name = charity.metadataURI;
        }
      } catch (e) {
        console.error("Failed to fetch charity metadata:", e);
      }

      charities.push({
        id: i,
        address: charity.charityAddress,
        metadataURI: charity.metadataURI,
        name: metadata.name || "No name set",
        description: metadata.description || "No description set",
        image: metadata.image ? metadata.image.replace("ipfs://", PINATA_GATEWAY) : "",
        isVerified: charity.isVerified,
        totalReceived: ethers.formatEther(charity.totalReceived)
      });
    }

    return NextResponse.json({ charities });
  } catch (error) {
    console.error("Error fetching charities:", error);
    return NextResponse.json({ error: "Failed to fetch charities", charities: [] }, { status: 500 });
  }
}