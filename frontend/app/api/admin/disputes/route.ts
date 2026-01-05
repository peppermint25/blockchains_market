import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const orderCount = await contract.orderCount();
    const disputes = [];

    for (let i = 0; i < orderCount; i++) {
      const order = await contract.getOrder(i);
      
      // Only get disputed orders (status === 4)
      if (Number(order.status) !== 4) continue;

      const listing = await contract.getListing(order.listingId);
      const disputeReason = await contract.getDisputeReason(i);

      // Fetch listing metadata
      let metadata = { name: "Unknown Item", description: "", image: "" };
      try {
        if (listing.metadataURI && listing.metadataURI.startsWith("ipfs://")) {
          const metadataURL = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          if (response.ok) {
            metadata = await response.json();
          }
        }
      } catch (e) {
        console.error("Failed to fetch listing metadata:", e);
      }

      let imageUrl = "";
      if (metadata.image) {
        imageUrl = metadata.image.startsWith("ipfs://")
          ? metadata.image.replace("ipfs://", PINATA_GATEWAY)
          : metadata.image;
      }

      disputes.push({
        orderId: i,
        listingId: Number(order.listingId),
        buyer: order.buyer,
        seller: order.seller,
        charity: order.charity,
        amount: ethers.formatEther(order.amount),
        reason: disputeReason,
        item: {
          name: metadata.name,
          description: metadata.description,
          image: imageUrl
        }
      });
    }

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json({ error: "Failed to fetch disputes", disputes: [] }, { status: 500 });
  }
}