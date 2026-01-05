import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required", orders: [] }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get buyer's order IDs
    const orderIds = await contract.getBuyerOrders(address);
    const orders = [];

    for (const orderId of orderIds) {
      const order = await contract.getOrder(orderId);
      const listing = await contract.getListing(order.listingId);

      // Fetch listing metadata from IPFS
      let metadata = { name: "Unknown Item", description: "", image: "" };
      try {
        if (listing.metadataURI) {
          if (listing.metadataURI.startsWith("ipfs://")) {
            const metadataURL = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const response = await fetch(metadataURL);
            if (response.ok) {
              metadata = await response.json();
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch listing metadata:", e);
      }

      // Fetch charity metadata
      let charityName = "Unknown Charity";
      try {
        const charityCount = await contract.getCharityCount();
        for (let i = 0; i < charityCount; i++) {
          const charity = await contract.getCharity(i);
          if (charity.charityAddress.toLowerCase() === order.charity.toLowerCase()) {
            // Only try to fetch if it's a valid IPFS URI
            if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
              const charityMetaURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
              const charityResponse = await fetch(charityMetaURL);
              if (charityResponse.ok) {
                const charityMeta = await charityResponse.json();
                charityName = charityMeta.name || "Unknown Charity";
              }
            } else if (charity.metadataURI && !charity.metadataURI.startsWith("ipfs://")) {
              // If it's just plain text (like "test"), use it as the name
              charityName = charity.metadataURI;
            }
            break;
          }
        }
      } catch (e) {
        console.error("Failed to fetch charity metadata:", e);
      }

      // Handle image URL
      let imageUrl = "";
      if (metadata.image) {
        if (metadata.image.startsWith("ipfs://")) {
          imageUrl = metadata.image.replace("ipfs://", PINATA_GATEWAY);
        } else {
          imageUrl = metadata.image;
        }
      }

      orders.push({
        id: Number(orderId),
        listingId: Number(order.listingId),
        buyer: order.buyer,
        seller: order.seller,
        charity: order.charity,
        charityName,
        amount: ethers.formatEther(order.amount),
        status: Number(order.status),
        shippedAt: Number(order.shippedAt),
        deliveredAt: Number(order.deliveredAt),
        item: {
          name: metadata.name,
          description: metadata.description,
          image: imageUrl
        }
      });
    }

    return NextResponse.json({ orders: orders.reverse() }); // Newest first
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders", orders: [] }, { status: 500 });
  }
}